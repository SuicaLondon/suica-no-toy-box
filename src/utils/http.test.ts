// @vitest-environment node
import { describe, expect, it } from "vitest";
import { errorResponse, isSameOrigin } from "./http";

const request = (headers: Record<string, string>) =>
  new Request("http://localhost:3000/api/tool", { method: "POST", headers });

describe("isSameOrigin", () => {
  it("allows a request with no Origin, such as curl", () => {
    expect(isSameOrigin(request({}))).toBe(true);
  });

  it("allows the site's own pages", () => {
    expect(isSameOrigin(request({ origin: "http://localhost:3000" }))).toBe(
      true,
    );
  });

  it("trusts the Host header over a URL a proxy rewrote", () => {
    expect(
      isSameOrigin(
        request({ host: "toys.example", origin: "https://toys.example" }),
      ),
    ).toBe(true);
  });

  it.each([
    ["another site", "https://another-site.example"],
    ["another port", "http://localhost:4000"],
    ["a sandboxed page", "null"],
  ])("refuses %s", (_, origin) => {
    expect(isSameOrigin(request({ origin }))).toBe(false);
  });
});

describe("errorResponse", () => {
  it("sends the message as JSON with the status, uncached", async () => {
    const response = errorResponse("Try again.", 429);
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ error: "Try again." });
  });
});
