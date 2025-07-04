import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CopyButton from "./index";

const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

const mockAlert = vi.fn();
global.alert = mockAlert;

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
      expect(mockAlert).toHaveBeenCalledWith("Copied to clipboard!");
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
});
