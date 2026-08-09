import { describe, expect, it } from "vitest";
import { getNextTheme, isDarkTheme } from "./theme";

describe("theme utilities", () => {
  it("identifies the dark theme", () => {
    expect(isDarkTheme("dark")).toBe(true);
    expect(isDarkTheme("light")).toBe(false);
    expect(isDarkTheme(undefined)).toBe(false);
  });

  it("toggles between explicit themes", () => {
    expect(getNextTheme("dark")).toBe("light");
    expect(getNextTheme("light")).toBe("dark");
    expect(getNextTheme(undefined)).toBe("dark");
  });
});
