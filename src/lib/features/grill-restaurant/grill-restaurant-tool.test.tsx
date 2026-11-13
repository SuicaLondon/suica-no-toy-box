import { ToolI18nProvider } from "@/i18n/tool-i18n";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GrillEvent } from "./check/grill-restaurant";
import { sseResponse } from "./test/fake-responses";
import { GrillRestaurantTool } from "./grill-restaurant-tool";

// The test runner does not process CSS: each class resolves to its own name.
vi.mock("./components/common/markdown/prose.module.css", () => ({
  default: new Proxy({}, { get: (_target, name) => String(name) }),
}));

const models = {
  google: "gemini-3.8-flash",
  otherSources: "gpt-6-luna",
  michelin: "gpt-6-luna",
  summary: "gpt-6-luna",
};

/** The page names sources and a verdict, never agents, models or providers. */
const BACKSTAGE = /agent|gemini|gpt|luna|claude|openai/i;

const started: GrillEvent[] = [
  {
    t: 0,
    type: "run.started",
    place: { name: "Secret Stall" },
    models,
    language: "en",
  },
  { t: 1, type: "agent.started", agent: "google" },
  { t: 1, type: "agent.started", agent: "otherSources" },
  { t: 1, type: "agent.started", agent: "michelin" },
  {
    t: 900,
    type: "agent.progress",
    agent: "michelin",
    text: "search: secret stall michelin",
  },
];

const sourcesDone: GrillEvent[] = [
  ...started,
  {
    t: 2000,
    type: "agent.completed",
    agent: "michelin",
    result: {
      model: "gpt-6-luna",
      searches: ["search: secret stall michelin"],
      searchCalls: 1,
      usage: { inputTokens: 1000, outputTokens: 100 },
      findings: {
        listed: true,
        guideUrl: "https://guide.michelin.com/secret",
        currentDistinction: "Bib Gourmand",
        inspectorSummary: "A careful bowl.",
        history: [{ year: 2026, distinction: "Bib Gourmand", sourceUrl: null }],
        notes: null,
      },
    },
  },
  {
    t: 3000,
    type: "agent.failed",
    agent: "otherSources",
    error: "OpenAI returned 429",
  },
  {
    t: 4000,
    type: "agent.completed",
    agent: "google",
    result: {
      reviews: [
        {
          text: "Worth the queue",
          date: "2026-05-01",
          uri: "https://www.google.com/maps/reviews/1",
          placeId: "P",
          round: 1,
        },
      ],
      elsewhere: [],
      gemini: {
        model: "gemini-3.8-flash",
        place: "Secret Stall",
        places: [
          {
            placeId: "P",
            title: "Secret Stall - Google Maps",
            uri: "https://maps.google.com/?cid=1",
            details: "**Address:** 1 Hidden Rd\n**Rating:** 4.3 (715 reviews)",
          },
        ],
        reviews: [],
        totalMapsQueries: 1,
        warnings: [],
        rounds: [
          {
            round: 1,
            question: "What do its reviews praise and complain about?",
            answerText:
              "### Pros\n\n* **Fresh** broth\n\n### Cons\n\n* Sticky tables\n\n### Divided\n\n* Some call the broth rich, others thin",
            reviewsReturned: 1,
            newReviews: 1,
            mapsQueries: ["secret stall"],
            usage: { inputTokens: 40, outputTokens: 300 },
            groundingMetadata: {},
          },
          {
            round: 2,
            question: "Which dishes do its reviews say are worth ordering?",
            answerText:
              "### Worth ordering\n\n* Prawn laksa: sweet prawns, most reviews",
            reviewsReturned: 1,
            newReviews: 0,
            mapsQueries: [],
            usage: { inputTokens: 40, outputTokens: 100 },
            groundingMetadata: {},
          },
        ],
      },
    },
  },
  { t: 4001, type: "agent.started", agent: "summary" },
];

const runCompleted: GrillEvent = {
  t: 5001,
  type: "run.completed",
  michelinTimeline: {
    firstListedYear: 2026,
    googleReviewsBefore: 0,
    googleReviewsFromThen: 1,
    googleReviewsUndated: 0,
  },
  cost: {
    total: 0.15,
    translations: {},
    agents: {
      google: {
        model: "gemini-3.8-flash",
        tokens: 0.01,
        toolCalls: 0.07,
        total: 0.08,
      },
      summary: { model: "gpt-6-luna", tokens: 0.07, toolCalls: 0, total: 0.07 },
    },
  },
};

const run: GrillEvent[] = [
  ...sourcesDone,
  {
    t: 5000,
    type: "agent.completed",
    agent: "summary",
    result: {
      model: "gpt-6-luna",
      verdict: {
        decision: "go",
        headline: "Go for the broth. Expect a queue.",
        good: ["MICHELIN calls the broth rich."],
        bad: ["Burpple calls the bowl small for S$8."],
        divided:
          "Two blogs call the broth too creamy, three call it mild. Bowls may vary between visits.",
        dishesToOrder: ["Cockle laksa: plump cockles, say three blogs"],
        dishesToSkip: ["Otah: dry, say two blogs"],
        goIf: ["You like a lighter laksa"],
        skipIf: ["You want a big bowl for little money"],
        headsUp: ["Lunch sells out by two."],
        hype: "The Bib Gourmand is new, and the reviews back it.",
        confidence: "medium",
      },
      usage: { inputTokens: 3000, outputTokens: 500 },
    },
  },
  runCompleted,
];

/** A stream that sends these events and then stays open. */
function openStream(events: GrillEvent[]) {
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(""),
          ),
        );
      },
    }),
  );
}

function renderTool() {
  return render(
    <ToolI18nProvider locale="en">
      <GrillRestaurantTool />
    </ToolI18nProvider>,
  );
}

async function submit(link: string) {
  const user = userEvent.setup();
  if (link) await user.type(screen.getByLabelText("Google Maps link"), link);
  await user.click(screen.getByRole("button", { name: "Grill it" }));
  return user;
}

async function finishedRun(events = run) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sseResponse(events)));
  const view = renderTool();
  const user = await submit("https://maps.app.goo.gl/AbC123");
  expect(await screen.findByText("Done in 5 s")).toBeVisible();
  return { user, view };
}

afterEach(() => vi.unstubAllGlobals());

describe("GrillRestaurantTool", () => {
  it("asks for a link before a check, without talking about agents", () => {
    const { container } = renderTool();
    expect(
      screen.getByRole("heading", { name: "Paste a link to start" }),
    ).toBeVisible();
    expect(container).not.toHaveTextContent(BACKSTAGE);
  });

  it("refuses an empty or non-Maps link without calling the server", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderTool();

    // "Google Maps" sits in its own element, so match the field's description.
    const field = screen.getByLabelText("Google Maps link");
    await submit("");
    await waitFor(() =>
      expect(field).toHaveAccessibleDescription(
        /Paste a Google Maps link first\./,
      ),
    );

    await submit("https://example.com/laksa");
    await waitFor(() =>
      expect(field).toHaveAccessibleDescription(
        /That is not a Google Maps link\./,
      ),
    );
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends only the link and the page's language", async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(run));
    vi.stubGlobal("fetch", fetchMock);
    renderTool();
    await submit("Secret Stall https://maps.app.goo.gl/AbC123");
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      url: "https://maps.app.goo.gl/AbC123",
      locale: "en",
    });
  });

  it("shows how long the check has left while it runs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(openStream(started)));
    renderTool();
    await submit("https://maps.app.goo.gl/AbC123");

    expect(
      await screen.findByRole("heading", { name: "Secret Stall" }),
    ).toBeVisible();
    expect(
      await screen.findByText(/^Grilling · about \d+ s left$/),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Stop" })).toBeVisible();
    // The verdict waits for the sources.
    const verdict = screen.getByRole("heading", { name: "The verdict" });
    expect(verdict).toBeVisible();
    expect(
      screen.getByText(
        "Checking the sources and writing the verdict takes a minute or two.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "What we're checking" }),
    ).toBeVisible();
    // A source opens only once it is done.
    expect(
      screen.queryByRole("button", { name: /MICHELIN Guide/ }),
    ).not.toBeInTheDocument();
  });

  it("leads with the verdict once the check is done", async () => {
    const { view } = await finishedRun();

    const headline = screen.getByRole("heading", {
      name: "Go for the broth. Expect a queue.",
    });
    expect(headline).toBeVisible();
    expect(
      screen.getByText("Go", { selector: "[data-decision]" }),
    ).toBeVisible();
    // A split among the sources is flagged right under the call.
    const split = screen.getByRole("note");
    expect(split).toHaveTextContent("Reviews disagree");
    expect(split).toHaveTextContent("Bowls may vary between visits.");
    // The good and the bad, each under its own label.
    const good = screen.getByRole("heading", { name: "The good" });
    expect(good.parentElement).toHaveTextContent(
      "MICHELIN calls the broth rich.",
    );
    const bad = screen.getByRole("heading", { name: "The bad" });
    expect(bad.parentElement).toHaveTextContent(
      "Burpple calls the bowl small for S$8.",
    );
    // The dishes worth ordering, and the ones not worth it.
    const order = screen.getByRole("heading", { name: "Worth ordering" });
    expect(order.parentElement).toHaveTextContent(
      "Cockle laksa: plump cockles, say three blogs",
    );
    const skip = screen.getByRole("heading", { name: "Not worth ordering" });
    expect(skip.parentElement).toHaveTextContent("Otah: dry, say two blogs");
    expect(screen.getByText("You like a lighter laksa")).toBeVisible();
    expect(
      screen.getByText("You want a big bowl for little money"),
    ).toBeVisible();
    expect(screen.getByText("Lunch sells out by two.")).toBeVisible();
    expect(
      screen.getByText("This check cost about $0.15 in API fees."),
    ).toBeVisible();

    // Nothing backstage reaches the page, not even a failed source's error.
    expect(view.container).not.toHaveTextContent(BACKSTAGE);
    // Google Maps is never translated or restyled.
    for (const name of screen.getAllByText("Google Maps")) {
      expect(name).toHaveAttribute("translate", "no");
    }
  });

  it("says so plainly when the verdict could not be written", async () => {
    const { view } = await finishedRun([
      ...sourcesDone,
      {
        t: 5000,
        type: "agent.failed",
        agent: "summary",
        error: "OpenAI returned 429",
      },
      runCompleted,
    ]);
    expect(
      screen.getByRole("heading", { name: "No verdict this time" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "The sources are still worth a look. Try again in a minute.",
      ),
    ).toBeVisible();
    expect(view.container).not.toHaveTextContent(BACKSTAGE);
  });

  it("explains a share link the server could not open, and keeps the link", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        sseResponse([
          {
            t: 300,
            type: "run.failed",
            error: "That share link did not lead to a Google Maps place.",
            code: "unreachable",
          },
        ]),
      ),
    );
    renderTool();
    await submit("https://maps.app.goo.gl/gone");
    expect(
      await screen.findByText(/That share link did not open a place/),
    ).toBeVisible();
    expect(screen.getByLabelText("Google Maps link")).toHaveValue(
      "https://maps.app.goo.gl/gone",
    );
  });

  it("asks for an access code when the server requires one", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { error: "An access code is required." },
            { status: 401 },
          ),
        ),
    );
    renderTool();
    await submit("https://maps.app.goo.gl/AbC123");
    expect(await screen.findByLabelText("Access code")).toBeVisible();
  });

  it("goes back to the link box to grill another", async () => {
    const { user } = await finishedRun();
    await user.click(screen.getByRole("button", { name: "Grill another" }));
    expect(screen.getByLabelText("Google Maps link")).toHaveValue("");
    expect(
      screen.queryByRole("heading", { name: /Go for the broth/ }),
    ).not.toBeInTheDocument();
  });
});

describe("GrillRestaurantTool sources", () => {
  it("lists what was checked under the verdict", async () => {
    await finishedRun();
    const verdict = screen.getByRole("heading", {
      name: "Go for the broth. Expect a queue.",
    });
    const checks = screen.getByRole("heading", { name: "What we checked" });
    expect(
      verdict.compareDocumentPosition(checks) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("lists what each source found and opens one at a time", async () => {
    const { user } = await finishedRun();

    const google = screen.getByRole("button", { name: /Google Maps reviews/ });
    expect(google).toHaveTextContent("4.3 from 715 reviews");
    expect(
      screen.getByRole("button", { name: /Review sites/ }),
    ).toHaveTextContent("Could not check");
    const michelin = screen.getByRole("button", { name: /MICHELIN Guide/ });
    expect(michelin).toHaveTextContent("Bib Gourmand, new in 2026");

    // Google Maps: its answer as returned, then the reviews behind it.
    await user.click(google);
    expect(google).toHaveAttribute("aria-expanded", "true");
    const googleDetail = document.getElementById("grill-source-google")!;
    // The row already gives the rating, so the detail does not repeat it.
    expect(within(googleDetail).queryByText(/715 reviews/)).toBeNull();
    expect(within(googleDetail).getByText("1 Hidden Rd")).toBeVisible();
    // Its pros and cons stand apart, under the answer's own headings.
    const pros = within(googleDetail).getByRole("heading", { name: "Pros" });
    expect(pros.parentElement).toHaveTextContent("Fresh broth");
    const cons = within(googleDetail).getByRole("heading", { name: "Cons" });
    expect(cons.parentElement).toHaveTextContent("Sticky tables");
    // Where reviews contradict each other, Google's own words, as a warning.
    const divided = within(googleDetail).getByRole("note");
    expect(divided).toHaveTextContent("Divided");
    expect(divided).toHaveTextContent("Some call the broth rich, others thin");
    // Its second answer: dishes worth ordering, with no list of ones to skip.
    const dishes = within(googleDetail).getByRole("heading", {
      name: "Worth ordering",
    });
    expect(dishes.parentElement).toHaveTextContent("Prawn laksa: sweet prawns");
    expect(
      within(googleDetail).queryByRole("heading", {
        name: "Not worth ordering",
      }),
    ).toBeNull();
    expect(within(googleDetail).getByText("Fresh")).toBeVisible();
    expect(within(googleDetail).getByText("Worth the queue")).toBeVisible();
    expect(
      within(googleDetail).getByRole("link", { name: /Open this review/ }),
    ).toHaveAttribute("href", "https://www.google.com/maps/reviews/1");

    // Opening another source closes the first.
    await user.click(michelin);
    expect(google).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("A careful bowl.")).toBeVisible();
  });
});

describe("GrillRestaurantTool in Chinese", () => {
  /** The same events, from a check started on the Chinese page. */
  const inChinese = (events: GrillEvent[]): GrillEvent[] =>
    events.map((event) =>
      event.type === "run.started" ? { ...event, language: "zh" } : event,
    );

  const translationDone: GrillEvent = {
    t: 2500,
    type: "translation.completed",
    agent: "michelin",
    translation: {
      language: "zh",
      model: "gpt-6-luna",
      usage: { inputTokens: 100, outputTokens: 100 },
      result: {
        model: "gpt-6-luna",
        searches: [],
        searchCalls: 1,
        usage: { inputTokens: 1000, outputTokens: 100 },
        findings: {
          listed: true,
          guideUrl: "https://guide.michelin.com/secret",
          currentDistinction: "必比登推介",
          inspectorSummary: "用心的一碗。",
          history: [{ year: 2026, distinction: "必比登推介", sourceUrl: null }],
          notes: null,
        },
      },
    },
  };

  const translationFailed: GrillEvent = {
    t: 2500,
    type: "translation.failed",
    agent: "michelin",
    error: "gpt-6-luna gave no answer",
  };

  /** Starts a check on the Chinese page; the stream stays open. */
  async function startInChinese(events: GrillEvent[]) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(openStream(inChinese(events))),
    );
    render(
      <ToolI18nProvider locale="zh">
        <GrillRestaurantTool />
      </ToolI18nProvider>,
    );
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText("Google Maps 連結"),
      "https://maps.app.goo.gl/AbC123",
    );
    await user.click(screen.getByRole("button", { name: "開烤" }));
    const michelin = await screen.findByRole("button", { name: /米其林指南/ });
    return { user, michelin };
  }

  it("keeps MICHELIN's findings back until their translation lands", async () => {
    const { user, michelin } = await startInChinese(sourcesDone);
    expect(michelin).toHaveTextContent("翻譯中…");
    await user.click(michelin);
    const detail = document.getElementById("grill-source-michelin")!;
    expect(within(detail).getByText("翻譯中…")).toBeVisible();
    expect(screen.queryByText("A careful bowl.")).toBeNull();
  });

  it("shows the translation once it lands", async () => {
    const { user, michelin } = await startInChinese([
      ...sourcesDone,
      translationDone,
    ]);
    await waitFor(() => expect(michelin).toHaveTextContent("必比登推介"));
    await user.click(michelin);
    expect(screen.getByText("用心的一碗。")).toBeVisible();
    expect(screen.queryByText("A careful bowl.")).toBeNull();

    // The original is one tap away, and back again.
    await user.click(screen.getByRole("button", { name: "顯示原文" }));
    expect(screen.getByText("A careful bowl.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "顯示翻譯" }));
    expect(screen.getByText("用心的一碗。")).toBeVisible();
  });

  it("keeps Google Maps back until Gemini's translation lands", async () => {
    const { user } = await startInChinese(sourcesDone);
    const google = screen.getByRole("button", { name: /Google Maps 評論/ });
    // Its line is a rating, so it shows at once.
    expect(google).toHaveTextContent("715");
    await user.click(google);
    const detail = document.getElementById("grill-source-google")!;
    expect(within(detail).getByText("翻譯中…")).toBeVisible();
    expect(screen.queryByText("Worth the queue")).toBeNull();
  });

  it("falls back to the English with a note when the translation fails", async () => {
    const { user, michelin } = await startInChinese([
      ...sourcesDone,
      translationFailed,
    ]);
    await user.click(michelin);
    expect(
      await screen.findByText("沒能翻成中文，以下是英文原文。"),
    ).toBeVisible();
    expect(screen.getByText("A careful bowl.")).toBeVisible();
  });
});
