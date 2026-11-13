import { describe, expect, it, vi } from "vitest";
import {
  classifyMapsLink,
  extractLink,
  MapsLinkError,
  readMapsUrl,
  resolveMapsLink,
} from "./maps-link";

const FULL =
  "https://www.google.com/maps/place/King+of+Laksa+(Kotthika%E2%80%99s+Fusion+Laksa)/@1.3201,103.8871,17z/data=!3m1!4b1!4m6!3m5!1s0x31da190039df5293:0x90d381c986539c3f!8m2!3d1.320059!4d103.887231";

/** Where a share.google link for the same place lands, as Google sent it. */
const SEARCH =
  "https://www.google.com/search?sca_esv=9c0ea2fc79e91fa8&cs=1&output=search&kgmid=/g/11yffp5229&q=King+of+Laksa+(Kotthika%E2%80%99s+Fusion+Laksa)&shndl=30&source=sh/x/loc/uni/m1/1";

describe("classifyMapsLink", () => {
  it.each([
    ["https://maps.app.goo.gl/AbC123", "short"],
    ["https://goo.gl/maps/AbC123", "short"],
    [FULL, "full"],
    ["https://www.google.co.uk/maps/place/X", "full"],
    ["https://maps.google.com/?q=Ichiran", "full"],
    ["https://www.google.com.sg/maps/search/laksa", "full"],
    ["https://share.google/JgkV8MhhS1nLwC0NL", "short"],
  ])("accepts %s", (link, kind) => {
    expect(classifyMapsLink(link).kind).toBe(kind);
  });

  it.each([
    ["not a link", "invalid"],
    ["ftp://maps.app.goo.gl/x", "invalid"],
    ["https://www.google.com/search?q=laksa", "unsupported"],
    ["https://goo.gl/abc", "unsupported"],
    ["https://maps.evil.com/maps/place/X", "unsupported"],
    ["https://www.google.com.evil.com/maps/place/X", "unsupported"],
  ])("rejects %s", (link, code) => {
    expect(() => classifyMapsLink(link)).toThrow(
      expect.objectContaining({ code }),
    );
  });
});

describe("extractLink", () => {
  it("picks the link out of share text and leaves other text alone", () => {
    expect(extractLink("King of Laksa\nhttps://maps.app.goo.gl/AbC123 ")).toBe(
      "https://maps.app.goo.gl/AbC123",
    );
    expect(extractLink("  King of Laksa ")).toBe("King of Laksa");
    expect(
      classifyMapsLink("Dinner here? https://maps.app.goo.gl/AbC123").kind,
    ).toBe("short");
  });
});

describe("readMapsUrl", () => {
  it("reads the name and prefers the place pin over the map centre", () => {
    expect(readMapsUrl(new URL(FULL))).toEqual({
      name: "King of Laksa (Kotthika’s Fusion Laksa)",
      latLng: { latitude: 1.320059, longitude: 103.887231 },
      mapsUrl: FULL,
    });
  });

  it("reads q and search paths, skipping bare coordinates", () => {
    expect(
      readMapsUrl(new URL("https://maps.google.com/?q=Ichiran+Shibuya,+Tokyo"))
        .name,
    ).toBe("Ichiran Shibuya, Tokyo");
    expect(
      readMapsUrl(
        new URL("https://www.google.com/maps/search/ramen+ichi/@35,139,15z"),
      ),
    ).toMatchObject({
      name: "ramen ichi",
      latLng: { latitude: 35, longitude: 139 },
    });
    expect(() =>
      readMapsUrl(new URL("https://maps.google.com/?q=1.3,103.8")),
    ).toThrow(expect.objectContaining({ code: "no-name" }));
  });

  it("keeps a % or + that is part of the name", () => {
    expect(
      readMapsUrl(new URL("https://maps.google.com/?q=100%25+Bakery+%2B+Cafe"))
        .name,
    ).toBe("100% Bakery + Cafe");
  });

  it("reads the place from the Google Search page a share.google link opens", () => {
    const place = readMapsUrl(new URL(SEARCH));
    expect(place.name).toBe("King of Laksa (Kotthika’s Fusion Laksa)");
    expect(place.latLng).toBeUndefined();
    // The place card links to Maps, not to Google Search.
    const maps = new URL(place.mapsUrl);
    expect(maps.origin + maps.pathname).toBe(
      "https://www.google.com/maps/search/",
    );
    expect(maps.searchParams.get("api")).toBe("1");
    expect(maps.searchParams.get("query")).toBe(place.name);
  });

  it("never reads share.google's own code as a name", () => {
    const hop = "https://www.google.com/share.google?q=JgkV8MhhS1nLwC0NL";
    expect(() => readMapsUrl(new URL(hop))).toThrow(
      expect.objectContaining({ code: "no-name" }),
    );
    const wrapped = `https://consent.google.com/ml?continue=${encodeURIComponent(hop)}`;
    expect(() => readMapsUrl(new URL(wrapped))).toThrow(
      expect.objectContaining({ code: "no-name" }),
    );
  });

  it("unwraps Google's consent page, and only Google's", () => {
    const consent = `https://consent.google.com/ml?continue=${encodeURIComponent(FULL)}`;
    expect(readMapsUrl(new URL(consent)).name).toContain("King of Laksa");
    const lookalike = `https://consent.evil.com/ml?continue=${encodeURIComponent(FULL)}`;
    expect(() => readMapsUrl(new URL(lookalike))).toThrow(
      expect.objectContaining({ code: "no-name" }),
    );
  });

  it("rejects links without a name, such as cid links", () => {
    expect(() =>
      readMapsUrl(new URL("https://maps.google.com/maps?cid=1043582746")),
    ).toThrow(MapsLinkError);
  });
});

describe("resolveMapsLink", () => {
  it("follows share-link redirects without fetching Maps itself", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: FULL },
      }),
    );
    const place = await resolveMapsLink(
      "https://maps.app.goo.gl/AbC123",
      fetchMock,
    );
    expect(place.name).toContain("King of Laksa");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ redirect: "manual" });
  });

  it("follows a share.google link through its own hop to the search page", async () => {
    const redirect = (location: string, status = 302) =>
      new Response(null, { status, headers: { location } });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        redirect("https://www.google.com/share.google?q=JgkV8MhhS1nLwC0NL"),
      )
      .mockResolvedValueOnce(redirect(SEARCH, 301));
    const place = await resolveMapsLink(
      "https://share.google/JgkV8MhhS1nLwC0NL",
      fetchMock,
    );
    expect(place.name).toBe("King of Laksa (Kotthika’s Fusion Laksa)");
    // Two redirects read; the search page itself is never fetched.
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "https://share.google/JgkV8MhhS1nLwC0NL",
      "https://www.google.com/share.google?q=JgkV8MhhS1nLwC0NL",
    ]);
  });

  it("does not follow a share link out of Google", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { location: "http://169.254.169.254/latest/meta-data" },
      }),
    );
    await expect(
      resolveMapsLink("https://share.google/AbC123", fetchMock),
    ).rejects.toMatchObject({
      code: "unreachable",
      message: expect.stringContaining("169.254.169.254"),
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not fetch full links", async () => {
    const fetchMock = vi.fn();
    await resolveMapsLink(FULL, fetchMock);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports dead or non-redirecting short links, after asking twice", async () => {
    const dead = vi
      .fn()
      .mockResolvedValue(new Response("Not found", { status: 404 }));
    await expect(
      resolveMapsLink("https://maps.app.goo.gl/gone", dead),
    ).rejects.toMatchObject({
      code: "unreachable",
      message: expect.stringContaining("status 404"),
    });
    expect(dead).toHaveBeenCalledTimes(2);
    await expect(
      resolveMapsLink(
        "https://maps.app.goo.gl/x",
        vi.fn().mockRejectedValue(new TypeError("network")),
      ),
    ).rejects.toMatchObject({
      code: "unreachable",
      message: expect.stringContaining("network"),
    });
  });

  it("goes through when the second try answers", async () => {
    const redirect = () =>
      new Response(null, { status: 302, headers: { location: FULL } });
    const dropped = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("other side closed"))
      .mockResolvedValueOnce(redirect());
    const place = await resolveMapsLink(
      "https://maps.app.goo.gl/AbC123",
      dropped,
    );
    expect(place.name).toContain("King of Laksa");
    expect(dropped).toHaveBeenCalledTimes(2);

    const notYet = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(redirect());
    await expect(
      resolveMapsLink("https://maps.app.goo.gl/AbC123", notYet),
    ).resolves.toMatchObject({
      name: expect.stringContaining("King of Laksa"),
    });
  });
});
