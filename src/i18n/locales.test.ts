import { describe, expect, it } from "vitest";
import { getPreferredLocale } from "./locales";

describe("getPreferredLocale", () => {
  it("uses English when no supported preference exists", () => {
    expect(getPreferredLocale("fr-FR, de;q=0.8")).toBe("en");
  });

  it("recognises regional Chinese language tags", () => {
    expect(getPreferredLocale("zh-TW, en;q=0.8")).toBe("zh");
  });

  it("respects Accept-Language quality weights", () => {
    expect(getPreferredLocale("en;q=0.2, zh-Hant;q=0.9")).toBe("zh");
  });

  it("ignores a supported language with zero quality", () => {
    expect(getPreferredLocale("zh;q=0, en;q=0.5")).toBe("en");
  });
});
