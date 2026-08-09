import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CopyButton from "./index";

const { mockToastError, mockToastSuccess } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe("CopyButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders copy button with correct svg icon", () => {
    render(<CopyButton text="test text" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    const icon = button.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("copies text to clipboard when clicked", async () => {
    const testText = "Hello, World!";
    mockWriteText.mockResolvedValue(undefined);

    render(<CopyButton text={testText} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(testText);
      expect(mockToastSuccess).toHaveBeenCalledWith("Copied to clipboard");
    });
  });

  it("handles clipboard write failure", async () => {
    const testText = "Test text";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockWriteText.mockRejectedValue(new Error("Clipboard not available"));

    render(<CopyButton text={testText} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(testText);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to copy:",
        expect.any(Error),
      );
      expect(mockToastError).toHaveBeenCalledWith("Could not copy text");
    });

    consoleSpy.mockRestore();
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-copy-button";
    render(<CopyButton text="test" className={customClass} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(customClass);
  });

  it("has correct button attributes", () => {
    render(<CopyButton text="test" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("is disabled when the text is empty or only whitespace", () => {
    render(<CopyButton text="   " />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
