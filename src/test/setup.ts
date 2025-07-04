import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

beforeAll(() => {
  vi.mock("next/navigation", () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/",
  }));

  vi.mock("next/image", () => ({
    default: (props: Record<string, unknown>) => {
      return props;
    },
  }));

  vi.mock("@/lib/prisma", () => ({
    prisma: {
      // Add your Prisma mocks here as needed
    },
  }));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
