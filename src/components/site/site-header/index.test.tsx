import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from ".";

vi.mock("@/hooks/use-toy-theme", () => ({
  useToyTheme: () => ({ isDark: false, toggleTheme: () => {} }),
}));

describe("SiteHeader", () => {
  it("names both languages, marking the page's own and linking the other", () => {
    render(<SiteHeader locale="zh" languageHref="/en/grill-restaurant" />);
    const languages = screen.getByRole("group", { name: "語言" });

    expect(languages).toHaveTextContent("English/中文");
    const current = within(languages).getByText("中文");
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toHaveAttribute("lang", "zh-Hant");
    expect(current.closest("a")).toBeNull();

    const other = within(languages).getByRole("link", { name: "English" });
    expect(other).toHaveAttribute("href", "/en/grill-restaurant");
    expect(other).toHaveAttribute("hrefLang", "en");
    expect(other).toHaveAttribute("lang", "en");
  });

  it("keeps the same order on the English page, linking to Chinese", () => {
    render(<SiteHeader locale="en" />);
    const languages = screen.getByRole("group", { name: "Language" });
    expect(languages).toHaveTextContent("English/中文");
    expect(within(languages).getByText("English")).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(
      within(languages).getByRole("link", { name: "中文" }),
    ).toHaveAttribute("href", "/zh");
  });
});
