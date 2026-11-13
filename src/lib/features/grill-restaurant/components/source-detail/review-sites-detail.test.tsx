import { grillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import type { PlatformReviews } from "../../agents/sources/other-sources";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AgentResults } from "../../check/grill-restaurant";
import { ReviewSitesDetail } from "./review-sites-detail";

// The test runner does not process CSS: each class resolves to its own name.
vi.mock("../common/markdown/prose.module.css", () => ({
  default: new Proxy({}, { get: (_target, name) => String(name) }),
}));

function site(platform: string, url: string | null): PlatformReviews {
  return {
    platform,
    url,
    rating: null,
    ratingScale: null,
    reviewCount: null,
    summary: `${platform} says it is good.`,
    pros: [],
    cons: [],
    dishesToOrder: [],
    dishesToSkip: [],
  };
}

const result = (
  platforms: PlatformReviews[],
): AgentResults["otherSources"] => ({
  findings: { platforms, notes: null },
  model: "gpt-6-luna",
  searches: [],
  searchCalls: 0,
  usage: { inputTokens: 0, outputTokens: 0 },
});

describe("ReviewSitesDetail", () => {
  it("lists each site's pros and cons under their own labels", () => {
    render(
      <ReviewSitesDetail
        messages={grillRestaurantMessages.en}
        result={result([
          {
            ...site("Tripadvisor", null),
            pros: ["Fresh prawns"],
            cons: ["Thin broth", "Long queue"],
          },
          site("Burpple", null),
        ])}
      />,
    );
    const pros = screen.getByRole("heading", { name: "Pros" });
    expect(pros).toHaveAttribute("data-tone", "good");
    expect(pros.parentElement).toHaveTextContent("Fresh prawns");
    const cons = screen.getByRole("heading", { name: "Cons" });
    expect(cons).toHaveAttribute("data-tone", "bad");
    expect(cons.parentElement).toHaveTextContent("Thin broth");
    expect(cons.parentElement).toHaveTextContent("Long queue");
    // A site with neither shows no empty labels.
    expect(screen.getAllByRole("heading", { name: "Pros" })).toHaveLength(1);
  });

  it("lists the dishes worth and not worth ordering, when a site names any", () => {
    render(
      <ReviewSitesDetail
        messages={grillRestaurantMessages.en}
        result={result([
          {
            ...site("Burpple", null),
            dishesToOrder: ["Prawn laksa: sweet prawns"],
            dishesToSkip: ["Otah: dry and small"],
          },
          site("Tripadvisor", null),
        ])}
      />,
    );
    const order = screen.getByRole("heading", { name: "Worth ordering" });
    expect(order).toHaveAttribute("data-tone", "good");
    expect(order.parentElement).toHaveTextContent("Prawn laksa: sweet prawns");
    const skip = screen.getByRole("heading", { name: "Not worth ordering" });
    expect(skip).toHaveAttribute("data-tone", "bad");
    expect(skip.parentElement).toHaveTextContent("Otah: dry and small");
    // The site that names no dishes shows no dish labels.
    expect(
      screen.getAllByRole("heading", { name: "Worth ordering" }),
    ).toHaveLength(1);
  });

  it("marks each site with its own mark, or the default one", () => {
    render(
      <ReviewSitesDetail
        messages={grillRestaurantMessages.en}
        result={{
          findings: {
            platforms: [
              site("Tripadvisor", "https://www.tripadvisor.co.uk/r"),
              site("Burpple", "https://www.burpple.com/king-of-laksa"),
              site("Instagram", null),
            ],
            notes: null,
          },
          model: "gpt-6-luna",
          searches: [],
          searchCalls: 0,
          usage: { inputTokens: 0, outputTokens: 0 },
        }}
      />,
    );

    const marks = [...document.querySelectorAll("[data-site-mark]")];
    expect(marks.map((mark) => mark.getAttribute("data-site-mark"))).toEqual([
      "tripadvisor",
      "default",
      "instagram",
    ]);
    // Decorative: each site is still named in text beside its mark.
    for (const mark of marks) {
      expect(mark).toHaveAttribute("aria-hidden", "true");
    }
    expect(
      screen.getByRole("heading", { name: "Tripadvisor" }),
    ).toBeInTheDocument();
  });
});
