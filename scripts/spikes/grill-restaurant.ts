/**
 * Grill Restaurant from the terminal: what Google Maps reviewers, other review
 * platforms and the MICHELIN Guide each say about a restaurant, every agent's
 * result as it came back, then the verdict. With --language zh each source is
 * printed as translated for the page (Google Maps by Gemini).
 *
 *   pnpm grill-restaurant "https://maps.app.goo.gl/…"           # a Maps link
 *   pnpm grill-restaurant "King of Laksa, Aljunied, Singapore"   # or a name
 *   pnpm grill-restaurant "<link>" --summary-model claude-opus-5-5
 *   pnpm grill-restaurant "<link>" --language zh                 # verdict in Traditional Chinese
 *   pnpm grill-restaurant "<link>" --details                     # every web search
 *   pnpm grill-restaurant "<link>" --json                        # final state as JSON
 *
 * Reads the same settings as the page from .env (check/grill-env.server.ts);
 * --gemini-model, --openai-model and --summary-model override the models.
 * Google Maps content is shown only to the person who asked and never stored
 * (ADR 0002, ADR 0003).
 */
import "dotenv/config";
import { parseArgs } from "node:util";
import type { GroundedReview } from "../../src/lib/features/grill-restaurant/agents/sources/google";
import { readGrillEnv } from "../../src/lib/features/grill-restaurant/check/grill-env.server";
import type {
  AgentId,
  GrillEvent,
} from "../../src/lib/features/grill-restaurant/check/grill-restaurant";
import { startGrillRun } from "../../src/lib/features/grill-restaurant/check/grill-run";
import {
  initialGrillState,
  reduceGrillEvent,
  type GrillRunState,
} from "../../src/lib/features/grill-restaurant/check/grill-state";
import { formatDollars } from "../../src/lib/features/grill-restaurant/providers/pricing";
import {
  formatRating,
  placeDetail,
} from "../../src/lib/features/grill-restaurant/view/sources/source-lines";
import { LINE_START } from "../../src/utils/regex";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    "gemini-model": { type: "string" },
    "openai-model": { type: "string" },
    "summary-model": { type: "string" },
    language: { type: "string", default: "en" },
    details: { type: "boolean", default: false },
    json: { type: "boolean", default: false },
  },
});

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const input = positionals.join(" ").trim();
if (!input) {
  fail(
    'Usage: pnpm grill-restaurant "<Google Maps link or name>" [--summary-model ID] [--language zh] [--details] [--json]',
  );
}

const AGENT_LABELS: Record<AgentId, string> = {
  google: "Google Maps",
  otherSources: "Other platforms",
  michelin: "MICHELIN",
  summary: "Summary",
};

const line = "─".repeat(72);
const indent = (text: string, prefix = "  ") =>
  text.replace(LINE_START, prefix);
const seconds = (t: number) => `${(t / 1000).toFixed(0).padStart(4)} s`;

function heading(title: string) {
  console.log(line);
  console.log(title);
  console.log(line);
}

function logEvent(event: GrillEvent) {
  if (values.json) return;
  const at = seconds(event.t);
  switch (event.type) {
    case "run.started":
      console.error(`${at}  Grilling ${event.place.name}`);
      break;
    case "agent.started":
      console.error(`${at}  ${AGENT_LABELS[event.agent]}: started`);
      break;
    case "agent.progress":
      console.error(`${at}  ${AGENT_LABELS[event.agent]}: ${event.text}`);
      break;
    case "agent.completed":
      console.error(`${at}  ${AGENT_LABELS[event.agent]}: done`);
      break;
    case "agent.failed":
      console.error(`${at}  ${AGENT_LABELS[event.agent]}: failed`);
      break;
    case "run.failed":
      console.error(`${at}  ${event.error}`);
      break;
    case "run.completed":
      break;
  }
}

function printReviews(reviews: GroundedReview[]) {
  reviews.forEach((r, i) => {
    console.log(
      `${String(i + 1).padStart(3)}. [${r.date ?? "no date"}] ${r.uri}`,
    );
    console.log(indent(r.text, "     "));
  });
}

function printReport(state: GrillRunState) {
  const { summary } = state.agents;
  // Each source as the page shows it: translated when it was.
  const shown = <A extends "google" | "otherSources" | "michelin">(id: A) => {
    const agent = state.agents[id];
    return { ...agent, result: agent.translation?.result ?? agent.result };
  };
  const google = shown("google");
  const otherSources = shown("otherSources");
  const michelin = shown("michelin");
  for (const id of ["google", "otherSources", "michelin"] as const) {
    const error = state.agents[id].translationError;
    if (error)
      console.log(`  ${AGENT_LABELS[id]} translation failed: ${error}`);
  }
  heading(`Grill Restaurant: ${state.place?.name ?? "?"}`);
  if (state.place?.mapsUrl) console.log(`  ${state.place.mapsUrl}`);

  heading(
    `1. GOOGLE MAPS AGENT (${google.model ?? "Gemini"}, grounded with Google Maps)`,
  );
  if (google.error) console.log(`  failed: ${google.error}`);
  if (google.result) {
    const { gemini, reviews, elsewhere } = google.result;
    const target = gemini.places[0];
    if (target) {
      const address = placeDetail(target.details, "Address");
      const rating = placeDetail(target.details, "Rating");
      console.log(`  ${target.title ?? "?"}  ${target.uri ?? ""}`);
      if (address) console.log(`  ${address}`);
      if (rating) console.log(`  Rating ${rating}`);
    }
    for (const w of gemini.warnings) console.log(`  ! ${w}`);
    for (const round of gemini.rounds) {
      console.log(`\n  Q: ${round.question.split("\n").at(-1)}`);
      console.log(indent(round.answerText, "  │ "));
    }
    console.log("\n  Sources: Google Maps");
    printReviews(reviews);
    if (elsewhere.length) {
      console.log("\n  Reviews of neighbouring places:");
      printReviews(elsewhere);
    }
  }

  heading(
    `2. OTHER PLATFORMS AGENT (${otherSources.model ?? "OpenAI"} web search)`,
  );
  if (otherSources.error) console.log(`  failed: ${otherSources.error}`);
  if (otherSources.result) {
    const { findings, searches } = otherSources.result;
    if (findings.platforms.length === 0) console.log("  None found.");
    for (const p of findings.platforms) {
      const rating =
        p.rating === null ? "no rating" : formatRating(p.rating, p.ratingScale);
      const count = p.reviewCount === null ? "" : `, ${p.reviewCount} reviews`;
      console.log(`\n  ${p.platform}: ${rating}${count}  ${p.url ?? ""}`);
      console.log(indent(p.summary, "    "));
      if (p.pros.length) console.log(`    + ${p.pros.join("\n    + ")}`);
      if (p.cons.length) console.log(`    - ${p.cons.join("\n    - ")}`);
    }
    if (findings.notes) console.log(`\n  notes: ${findings.notes}`);
    if (values.details) console.log(indent(searches.join("\n"), "  · "));
  }

  heading(`3. MICHELIN AGENT (${michelin.model ?? "OpenAI"} web search)`);
  if (michelin.error) console.log(`  failed: ${michelin.error}`);
  if (michelin.result) {
    const { findings, searches } = michelin.result;
    if (!findings.listed) console.log("  Not listed.");
    else {
      console.log(
        `  Current: ${findings.currentDistinction ?? "?"}  ${findings.guideUrl ?? ""}`,
      );
      for (const h of [...findings.history].sort((a, b) => a.year - b.year)) {
        console.log(`  ${h.year}: ${h.distinction}  ${h.sourceUrl ?? ""}`);
      }
      if (findings.inspectorSummary) {
        console.log(indent(`Inspector: ${findings.inspectorSummary}`, "  "));
      }
    }
    if (findings.notes) console.log(`  notes: ${findings.notes}`);
    const t = state.michelinTimeline;
    if (t) {
      console.log(
        `  Google review excerpts before ${t.firstListedYear}: ${t.googleReviewsBefore}, ` +
          `from ${t.firstListedYear}: ${t.googleReviewsFromThen}, undated: ${t.googleReviewsUndated}`,
      );
    }
    if (values.details) console.log(indent(searches.join("\n"), "  · "));
  }

  heading(
    `VERDICT (${summary.model ?? "?"}; from review sites and MICHELIN only, never Google Maps)`,
  );
  if (summary.error) console.log(`  failed: ${summary.error}`);
  if (summary.result) {
    const { verdict } = summary.result;
    console.log(`  ${verdict.decision.toUpperCase()}  ${verdict.headline}`);
    if (verdict.divided) console.log(`  divided ${verdict.divided}`);
    for (const item of verdict.good) console.log(`  good    ${item}`);
    for (const item of verdict.bad) console.log(`  bad     ${item}`);
    for (const item of verdict.dishesToOrder) console.log(`  order   ${item}`);
    for (const item of verdict.dishesToSkip) console.log(`  skip    ${item}`);
    for (const item of verdict.goIf) console.log(`  go if   ${item}`);
    for (const item of verdict.skipIf) console.log(`  skip if ${item}`);
    for (const item of verdict.headsUp) console.log(`  heads up ${item}`);
    if (verdict.hype) console.log(`  hype    ${verdict.hype}`);
    console.log(`  confidence ${verdict.confidence}`);
  }

  if (state.cost) {
    heading("ESTIMATED COST (list prices, ignoring free allowances)");
    for (const [agent, cost] of Object.entries(state.cost.agents)) {
      console.log(
        `  ${AGENT_LABELS[agent as AgentId].padEnd(16)} ${cost.model.padEnd(18)} ` +
          `tokens ${formatDollars(cost.tokens).padStart(7)}   tools ${formatDollars(cost.toolCalls).padStart(7)}   ` +
          `total ${formatDollars(cost.total)}`,
      );
    }
    console.log(
      `  ${"Run".padEnd(35)} total ${formatDollars(state.cost.total)}`,
    );
  }
  console.log(line);
  console.log(
    `Done in ${seconds(state.t).trim()}. Google Maps content: show only to the person who asked; do not store.`,
  );
}

async function main() {
  // The page's settings, with the models the command line names instead.
  const settings = readGrillEnv({
    ...process.env,
    GEMINI_MODEL: values["gemini-model"] ?? process.env.GEMINI_MODEL,
    OPENAI_MODEL: values["openai-model"] ?? process.env.OPENAI_MODEL,
    SUMMARY_MODEL: values["summary-model"] ?? process.env.SUMMARY_MODEL,
  });
  if (!settings.ok) fail(`Fix .env: ${settings.problems.join("; ")}`);

  let state = initialGrillState();
  await startGrillRun({
    ...settings.env.providers,
    input,
    allowNames: true,
    language: values.language === "zh" ? "zh" : "en",
    onEvent: (event) => {
      state = reduceGrillEvent(state, event);
      logEvent(event);
    },
  });

  if (values.json) console.log(JSON.stringify(state, null, 2));
  else if (state.status === "failed") fail(state.error ?? "Run failed");
  else printReport(state);
}

main().catch((error) => fail(String(error)));
