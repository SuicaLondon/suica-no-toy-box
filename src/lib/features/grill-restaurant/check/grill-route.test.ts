// @vitest-environment node
import { POST } from "@/app/api/grill-restaurant/route";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GrillEvent } from "./grill-restaurant";
import { startGrillRun } from "./grill-run";
import { readSse } from "../stream/sse";

const events: GrillEvent[] = [
  {
    t: 0,
    type: "run.started",
    place: { name: "Secret Stall" },
    models: {
      google: "gemini-test",
      otherSources: "gpt-test",
      michelin: "gpt-test",
      summary: "gpt-test",
    },
    language: "en",
  },
  { t: 5, type: "run.failed", error: "No luck.", code: "unreachable" },
];

vi.mock("./grill-run", () => ({
  startGrillRun: vi.fn(
    async ({ onEvent }: { onEvent: (event: GrillEvent) => void }) => {
      for (const event of events) onEvent(event);
    },
  ),
}));

const LINK = "https://maps.app.goo.gl/AbC123";

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("http://localhost/api/grill-restaurant", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

async function errorOf(response: Response) {
  return ((await response.json()) as { error: string }).error;
}

beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "gemini-key");
  vi.stubEnv("OPENAI_API_KEY", "openai-key");
  vi.stubEnv("GRILL_RESTAURANT_ACCESS_CODE", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("POST /api/grill-restaurant", () => {
  it("refuses a request from another site", async () => {
    const response = await post(
      { url: LINK },
      { origin: "https://another-site.example" },
    );
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await errorOf(response)).toBe(
      "Cross-origin requests are not allowed.",
    );
    expect(startGrillRun).not.toHaveBeenCalled();
  });

  it("accepts the page's own origin when a proxy rewrites the URL", async () => {
    const response = await post(
      { url: LINK },
      { host: "toys.example", origin: "https://toys.example" },
    );
    expect(response.status).toBe(200);
  });

  it("asks for the access code when one is set", async () => {
    vi.stubEnv("GRILL_RESTAURANT_ACCESS_CODE", "secret");
    const refused = await post({ url: LINK });
    expect(refused.status).toBe(401);
    expect(await errorOf(refused)).toBe("An access code is required.");

    const allowed = await post({ url: LINK }, { "x-access-code": "secret" });
    expect(allowed.status).toBe(200);
  });

  it("says so when a key is missing, and logs which one", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await post({ url: LINK });
    expect(response.status).toBe(503);
    expect(await errorOf(response)).toBe("Grill Restaurant is not configured.");
    expect(log).toHaveBeenCalledWith(
      "Grill Restaurant is not configured: GEMINI_API_KEY is not set",
    );
    expect(startGrillRun).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it.each([
    ["no link", {}, "Paste a Google Maps link."],
    ["a body that is not JSON", "laksa", "Paste a Google Maps link."],
    [
      "a language the page does not have",
      { url: LINK, locale: "fr" },
      "Paste a Google Maps link.",
    ],
    [
      "a link that is not Google Maps",
      { url: "https://example.com/laksa" },
      "That is not a Google Maps link.",
    ],
  ])("refuses %s before paying for a check", async (_, body, message) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(await errorOf(response)).toBe(message);
    expect(startGrillRun).not.toHaveBeenCalled();
  });

  it("streams the check as server-sent events, in the page's language", async () => {
    const response = await post({ url: LINK, locale: "zh" });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/event-stream; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, no-transform",
    );

    const received: unknown[] = [];
    for await (const message of readSse(response.body!)) {
      received.push(JSON.parse(message.data));
    }
    expect(received).toEqual(events);
    expect(startGrillRun).toHaveBeenCalledWith(
      expect.objectContaining({
        input: LINK,
        language: "zh",
        geminiApiKey: "gemini-key",
        openaiApiKey: "openai-key",
      }),
    );
  });
});
