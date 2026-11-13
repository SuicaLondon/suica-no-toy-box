import { describe, expect, it } from "vitest";
import { SITE_MARK_PATHS } from "./site-mark-paths";
import { siteMarkFor } from "./site-marks";

const byUrl = (url: string, name = "Some site") =>
  siteMarkFor({ url, name })?.id ?? null;
const byName = (name: string) => siteMarkFor({ url: null, name })?.id ?? null;

describe("siteMarkFor", () => {
  it("knows a site from its host in any country and on any subdomain", () => {
    expect(byUrl("https://www.tripadvisor.co.uk/Restaurant_Review-g1")).toBe(
      "tripadvisor",
    );
    expect(byUrl("https://www.yelp.com.sg/biz/x")).toBe("yelp");
    expect(byUrl("https://blog.naver.com/x/1")).toBe("naver");
    expect(byUrl("https://place.map.kakao.com/1")).toBe("kakao");
    expect(byUrl("https://someone.blogspot.com/2026/05/laksa.html")).toBe(
      "blogger",
    );
    expect(byUrl("https://www.foodpanda.com.tw/restaurant/x")).toBe(
      "foodpanda",
    );
  });

  it("knows short links and whole domains, but not lookalikes", () => {
    expect(byUrl("https://youtu.be/abc")).toBe("youtube");
    expect(byUrl("https://fb.me/x")).toBe("facebook");
    expect(byUrl("https://xhslink.com/a/b")).toBe("xiaohongshu");
    expect(byUrl("https://x.com/someone/status/1")).toBe("x");
    expect(byUrl("https://mobile.twitter.com/someone")).toBe("x");
    expect(byUrl("https://x.example.com/post")).toBeNull();
    expect(byUrl("https://food.grab.com/sg/en/restaurant/x")).toBe("grab");
  });

  it("gives a site without a mark nothing, even when its name has one", () => {
    expect(byUrl("https://sethlui.com/king-of-laksa-singapore/")).toBeNull();
    expect(byUrl("https://guide.michelin.com/sg/en/x")).toBeNull();
    expect(byUrl("https://example.com/review", "Tripadvisor")).toBeNull();
  });

  it("falls back to the name without a usable link", () => {
    expect(byName("Instagram")).toBe("instagram");
    expect(byName("Uber Eats")).toBe("ubereats");
    expect(byName("Xiaohongshu (RED)")).toBe("xiaohongshu");
    expect(byName("小紅書")).toBe("xiaohongshu");
    expect(byName("Naver Blog")).toBe("naver");
    expect(byName("X (formerly Twitter)")).toBe("x");
    expect(byName("Grabbing Bites")).toBeNull();
    expect(byName("Burpple")).toBeNull();
    expect(siteMarkFor({ url: "not a link", name: "TikTok" })?.id).toBe(
      "tiktok",
    );
  });

  it("returns the mark's own path", () => {
    expect(siteMarkFor({ url: null, name: "Reddit" })).toEqual({
      id: "reddit",
      ...SITE_MARK_PATHS.reddit,
    });
  });
});
