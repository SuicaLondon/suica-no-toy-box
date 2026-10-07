import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToolI18nProvider } from "@/i18n/tool-i18n";
import { useImageCompression } from "@/hooks/use-image-compression";
import { ImageCompressTool } from "./image-compress-tool";

vi.mock("./image-preview/image-preview.module.css", () => ({
  default: { outputImage: "outputImage", loading: "loading" },
}));

vi.mock("@/hooks/use-image-compression", () => ({
  useImageCompression: vi.fn(),
}));

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.mocked(useImageCompression).mockReturnValue({
    source: null,
    result: null,
    previousResult: null,
    error: "",
    estimate: null,
    remoteProgress: null,
    cancel: vi.fn(),
    retry: vi.fn(),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("Image Studio localization", () => {
  it("renders Chinese controls and preserves processing values", () => {
    render(
      <ToolI18nProvider locale="zh">
        <ImageCompressTool />
      </ToolI18nProvider>,
    );
    expect(screen.getByRole("radio", { name: "本機處理" })).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("選擇圖片以開始。");
    expect(screen.getByLabelText("選擇圖片")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "遠端伺服器" }));
    expect(useImageCompression).toHaveBeenLastCalledWith(null, null, "remote");
    expect(screen.getByText(/遠端上限 4 MB/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "手動設定" }));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "jpeg" },
    });
    expect(useImageCompression).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ mode: "manual", format: "jpeg" }),
      "remote",
    );
  });

  it("updates an existing validation error when the locale changes", () => {
    const { rerender } = render(
      <ToolI18nProvider locale="zh">
        <ImageCompressTool />
      </ToolI18nProvider>,
    );
    fireEvent.change(screen.getByLabelText("選擇圖片"), {
      target: {
        files: [new File(["text"], "notes.txt", { type: "text/plain" })],
      },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "請選擇 JPEG、PNG、WebP 或 HEIC 圖片。",
    );
    rerender(
      <ToolI18nProvider locale="en">
        <ImageCompressTool />
      </ToolI18nProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a JPEG, PNG, WebP or HEIC image.",
    );
    expect(screen.getByRole("radio", { name: "On device" })).toBeChecked();
  });

  it("localizes processing errors and the remote recovery action", () => {
    vi.mocked(useImageCompression).mockReturnValue({
      ...useImageCompression(null, null, "local"),
      error: "Remote conversion failed. Retry or switch to local mode.",
    });
    render(
      <ToolI18nProvider locale="zh">
        <ImageCompressTool />
      </ToolI18nProvider>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "遠端伺服器" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "遠端轉換失敗，請重試或切換至本機模式。",
    );
    fireEvent.click(screen.getByRole("button", { name: "改用本機模式" }));
    expect(screen.getByRole("radio", { name: "本機處理" })).toBeChecked();
  });
});
