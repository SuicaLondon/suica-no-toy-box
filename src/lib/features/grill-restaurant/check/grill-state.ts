/**
 * Folds GrillEvents into what each agent is doing. Shared by the CLI, the
 * page and tests, so all three read a check the same way.
 */
import type { Language } from "../agents/common/agent";
import type { Translation } from "../agents/translation/translation";
import type {
  AgentId,
  AgentResults,
  GrillEvent,
  GrillEventBody,
  GrillPlace,
  MichelinTimeline,
  RunCost,
} from "./grill-restaurant";

export type AgentStatus = "waiting" | "running" | "done" | "failed";

export type AgentState<A extends AgentId = AgentId> = {
  status: AgentStatus;
  model?: string;
  progress: { t: number; text: string }[];
  startedAt?: number;
  endedAt?: number;
  result?: AgentResults[A];
  error?: string;
  /** The result in the reader's language, once translated. */
  translation?: Translation<AgentResults[A]>;
  /** Why the translation failed, when it did. */
  translationError?: string;
};

export type GrillRunState = {
  status: "idle" | "running" | "done" | "failed";
  place?: GrillPlace;
  /** The reader's language, from the run's start. */
  language: Language;
  agents: { [A in AgentId]: AgentState<A> };
  michelinTimeline: MichelinTimeline | null;
  cost?: RunCost;
  error?: string;
  /** Why the pasted link could not be used, when that is why the run failed. */
  errorCode?: "invalid" | "unsupported" | "no-name" | "unreachable";
  /** Time of the latest event. */
  t: number;
};

function waitingAgents(
  models?: Record<AgentId, string>,
): GrillRunState["agents"] {
  const waiting = (agent: AgentId) => ({
    status: "waiting" as const,
    progress: [],
    model: models?.[agent],
  });
  return {
    google: waiting("google"),
    otherSources: waiting("otherSources"),
    michelin: waiting("michelin"),
    summary: waiting("summary"),
  };
}

export function initialGrillState(): GrillRunState {
  return {
    status: "idle",
    language: "en",
    agents: waitingAgents(),
    michelinTimeline: null,
    t: 0,
  };
}

function updateAgent(
  state: GrillRunState,
  agent: AgentId,
  update: (current: AgentState) => AgentState,
): GrillRunState {
  return {
    ...state,
    agents: { ...state.agents, [agent]: update(state.agents[agent]) },
  };
}

export function reduceGrillEvent(
  state: GrillRunState,
  event: GrillEvent,
): GrillRunState {
  const next = { ...state, t: event.t };
  switch (event.type) {
    case "run.started":
      return {
        ...initialGrillState(),
        status: "running",
        place: event.place,
        language: event.language,
        t: event.t,
        agents: waitingAgents(event.models),
      };
    case "agent.started":
      return updateAgent(next, event.agent, (a) => ({
        ...a,
        status: "running",
        startedAt: event.t,
      }));
    case "agent.progress":
      return updateAgent(next, event.agent, (a) => ({
        ...a,
        progress: [...a.progress, { t: event.t, text: event.text }],
      }));
    case "agent.completed":
      return updateAgent(next, event.agent, (a) => ({
        ...a,
        status: "done",
        endedAt: event.t,
        result: event.result,
      }));
    case "agent.failed":
      return updateAgent(next, event.agent, (a) => ({
        ...a,
        status: "failed",
        endedAt: event.t,
        error: event.error,
      }));
    case "run.completed":
      return {
        ...next,
        status: "done",
        michelinTimeline: event.michelinTimeline,
        cost: event.cost,
      };
    case "translation.completed":
      return updateAgent(next, event.agent, (a) => ({
        ...a,
        translation: event.translation,
      }));
    case "translation.failed":
      return updateAgent(next, event.agent, (a) => ({
        ...a,
        translationError: event.error,
      }));
    case "run.failed":
      return {
        ...next,
        status: "failed",
        error: event.error,
        errorCode: event.code,
      };
  }
}

/** Adds the `t` timestamp to each event, measured from when this is called. */
export function timestamped(
  listener: (event: GrillEvent) => void,
  now: () => number = () => performance.now(),
): (event: GrillEventBody) => void {
  const start = now();
  return (event) =>
    listener({ ...event, t: Math.round(now() - start) } as GrillEvent);
}
