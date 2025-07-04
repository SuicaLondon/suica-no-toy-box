import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { expect } from "vitest";

/**
 * Custom render function that includes common providers
 * Extend this as your app grows with providers like:
 * - React Query Provider
 * - Theme Provider
 * - Form Provider
 * - Router Provider (if using client-side routing)
 */

/**
 * Wrapper component that includes all necessary providers
 */
const AllProviders = ({ children }: { children: ReactNode }) => {
  // TODO: Add providers herer

  return <>{children}</>;
};

/**
 * Custom render method that wraps components with necessary providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

export * from "@testing-library/react";

export { customRender as render };

/**
 * Common test data factory functions
 */
export const createMockFormData = (
  overrides: Record<string, unknown> = {},
) => ({
  ...overrides,
});

/**
 * Common assertions helpers
 */
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveCorrectAccessibility = (
  element: HTMLElement,
  expectedRole?: string,
) => {
  if (expectedRole) {
    expect(element).toHaveAttribute("role", expectedRole);
  }

  const ariaLabel = element.getAttribute("aria-label");
  const ariaLabelledBy = element.getAttribute("aria-labelledby");
  const ariaDescribedBy = element.getAttribute("aria-describedby");

  if (
    ["button", "link", "textbox", "combobox"].includes(
      element.tagName.toLowerCase(),
    )
  ) {
    expect(
      ariaLabel ||
        ariaLabelledBy ||
        ariaDescribedBy ||
        element.textContent?.trim(),
    ).toBeTruthy();
  }
};
