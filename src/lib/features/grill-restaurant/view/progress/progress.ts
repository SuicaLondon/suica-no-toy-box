/**
 * The numbers behind a check's progress: where each source stands, and when
 * the whole check should end. Pure, so it can be tested without a browser.
 */
import { tryCatch } from "@/utils/try-catch";
import { QUESTION_ANGLES } from "../../agents/sources/google";
import type { AgentId } from "../../check/grill-restaurant";
import type { AgentState, GrillRunState } from "../../check/grill-state";
import { WWW_PREFIX } from "@/utils/regex";
import { ANSWERED_LINE, PAGE_ACTION_LINE } from "../../regex";

/**
 * The three sources, then the verdict, which starts last. The translation
 * has no lane: the page never shows it as a step of its own.
 */
const LANES = ["google", "otherSources", "michelin", "summary"] as const;
export type LaneAgent = (typeof LANES)[number];

export type LaneStatus = "waiting" | "running" | "done" | "failed" | "stopped";

export type Lane = {
  agent: LaneAgent;
  status: LaneStatus;
};

export type ProgressLine =
  | { kind: "search"; query: string }
  | { kind: "open"; url: string }
  | { kind: "find"; url: string }
  | { kind: "ask"; question: string }
  | {
      kind: "answered";
      reviews: number;
      fresh: number;
      searches: number;
      queries: string[];
    }
  | { kind: "reading" }
  | { kind: "note"; text: string };

/** Reads the progress strings the agents emit; unknown ones pass through. */
export function parseProgress(text: string): ProgressLine {
  const answered = ANSWERED_LINE.exec(text);
  if (answered) {
    return {
      kind: "answered",
      reviews: Number(answered[1]),
      fresh: Number(answered[2]),
      searches: Number(answered[3]),
      queries: answered[4] ? answered[4].split(" · ") : [],
    };
  }
  if (text.startsWith("search: ")) {
    return { kind: "search", query: text.slice(8) };
  }
  if (text.startsWith("Asking: ")) {
    return { kind: "ask", question: text.slice(8) };
  }
  if (text.startsWith("Reading the other platforms")) {
    return { kind: "reading" };
  }
  const action = PAGE_ACTION_LINE.exec(text);
  if (action) {
    return action[1] === "find_in_page"
      ? { kind: "find", url: action[2] }
      : { kind: "open", url: action[2] };
  }
  return { kind: "note", text };
}

/** "https://www.tripadvisor.com.sg/x" → "tripadvisor.com.sg". */
export function hostOf(url: string): string {
  const { data: parsed } = tryCatch(() => new URL(url));
  return parsed ? parsed.hostname.replace(WWW_PREFIX, "") : url;
}

/**
 * @param stoppedAt Milliseconds at which the check was stopped or cut off,
 *   or null while it is live or after it completed.
 */
export function buildLane(
  agent: LaneAgent,
  state: AgentState,
  stoppedAt: number | null,
): Lane {
  const unfinished = state.status === "running" || state.status === "waiting";
  return {
    agent,
    status: stoppedAt !== null && unfinished ? "stopped" : state.status,
  };
}

export function buildLanes(
  agents: GrillRunState["agents"],
  stoppedAt: number | null,
): Lane[] {
  return LANES.map((agent) => buildLane(agent, agents[agent], stoppedAt));
}

/**
 * How long each agent usually takes with the default models, in seconds,
 * from recorded runs: Google Maps asks gemini-3.8-flash one question in about
 * 18 to 25 s and now asks two in turn (its figure is that doubled, a guess
 * until runs measure it), the web searches run on gpt-6-luna (other platforms
 * 47 s, MICHELIN 25 to 28 s) and so does the summary (8 s). The translation, on a page in
 * another language, is a guess until runs measure it. Other models will
 * differ; the page then says the check is taking longer than usual rather
 * than guessing again.
 */
export const TYPICAL_SECONDS: Record<AgentId, number> = {
  google: 45,
  otherSources: 50,
  michelin: 30,
  summary: 9,
};

/** A source's translation, once it has finished: a guess until runs measure it. */
const TRANSLATION_SECONDS = 8;

/** Google Maps asks this many questions, one after the other. */
const GOOGLE_QUESTIONS = QUESTION_ANGLES.length;

export type LaneEstimate = {
  /** When the agent started, or is expected to start, in seconds. */
  start: number;
  /** When it is expected to finish, in seconds. Never before `now`. */
  end: number;
  /** True once it has run past its usual time. */
  overdue: boolean;
};

export type RunEstimate = {
  /** Only for agents still working or waiting. */
  lanes: Partial<Record<AgentId, LaneEstimate>>;
  /** When the whole run is expected to finish, in seconds. */
  end: number;
  /** True when the agent the run is waiting on is running long. */
  overdue: boolean;
};

function settle(start: number, end: number, now: number): LaneEstimate {
  return now > end
    ? { start, end: now, overdue: true }
    : { start, end, overdue: false };
}

/**
 * Where each unfinished agent should end, from how long it usually takes.
 * Google Maps refines its estimate from how long its first question took;
 * the summary, and the translation when there is one, start when both web
 * searches are expected to end.
 *
 * @param now Seconds since the run began.
 * @param translates Whether the reader's language needs a translation.
 */
export function estimateRun(
  lanes: Lane[],
  agents: GrillRunState["agents"],
  now: number,
  translates = false,
): RunEstimate {
  const estimates: RunEstimate["lanes"] = {};
  const byAgent = new Map(lanes.map((lane) => [lane.agent, lane]));
  const ended = (agent: LaneAgent) => {
    const lane = byAgent.get(agent);
    return lane?.status === "done" || lane?.status === "failed";
  };

  for (const agent of ["google", "otherSources", "michelin"] as const) {
    if (ended(agent) || byAgent.get(agent)?.status === "stopped") continue;
    const state = agents[agent];
    const start = state.startedAt === undefined ? now : state.startedAt / 1000;
    let typical = TYPICAL_SECONDS[agent];
    if (agent === "google") {
      const answers = state.progress.filter(
        (line) => parseProgress(line.text).kind === "answered",
      );
      const last = answers.at(-1);
      if (answers.length >= GOOGLE_QUESTIONS) {
        // Every question is answered; only the hand-over is left.
        estimates[agent] = { start, end: now, overdue: false };
        continue;
      }
      if (last) {
        const perQuestion = (last.t / 1000 - start) / answers.length;
        typical = perQuestion * GOOGLE_QUESTIONS;
      }
    }
    estimates[agent] = settle(start, start + typical, now);
  }

  const web = ["otherSources", "michelin"] as const;
  const webEnd = Math.max(
    now,
    ...web.map((agent) =>
      ended(agent)
        ? (agents[agent].endedAt ?? 0) / 1000
        : (estimates[agent]?.end ?? now),
    ),
  );
  const summaryLane = byAgent.get("summary");
  if (!ended("summary") && summaryLane?.status !== "stopped") {
    const { startedAt } = agents.summary;
    const start = startedAt === undefined ? webEnd : startedAt / 1000;
    estimates.summary = settle(start, start + TYPICAL_SECONDS.summary, now);
  }

  // Each source is translated once it finishes, unless it failed.
  const translations: LaneEstimate[] = [];
  for (const agent of ["google", "otherSources", "michelin"] as const) {
    const state = agents[agent];
    const status = byAgent.get(agent)?.status;
    const settled = state.translation || state.translationError;
    if (!translates || settled || status === "failed" || status === "stopped") {
      continue;
    }
    const start = ended(agent)
      ? (state.endedAt ?? 0) / 1000
      : (estimates[agent]?.end ?? now);
    translations.push(settle(start, start + TRANSLATION_SECONDS, now));
  }

  const pending = [...Object.values(estimates), ...translations];
  const last = pending.reduce<LaneEstimate | null>(
    (latest, estimate) =>
      !latest || estimate.end > latest.end ? estimate : latest,
    null,
  );
  return {
    lanes: estimates,
    end: last?.end ?? now,
    overdue: last?.overdue ?? false,
  };
}

/** Seconds left, rounded so the number does not flicker: 5 s steps above 10 s. */
export function secondsLeft(end: number, now: number): number {
  const left = Math.max(0, end - now);
  return left > 10 ? Math.ceil(left / 5) * 5 : Math.ceil(left);
}

/** 31400 → "0:31". */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
