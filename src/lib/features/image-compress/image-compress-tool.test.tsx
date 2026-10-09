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

describe("crop controls", () => {
  function renderTool() {
    render(
      <ToolI18nProvider locale="en">
        <ImageCompressTool />
      </ToolI18nProvider>,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "jpeg" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Set exact dimensions" }),
    );
  }

  it("sends exact pixel dimensions and preserves physical size across units", () => {
    renderTool();
    expect(useImageCompression).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({
        output: { width: 413, height: 531, ppi: 300, x: 0.5, y: 0.5, zoom: 1 },
      }),
      "local",
    );
    fireEvent.change(screen.getByLabelText("Size units"), {
      target: { value: "cm" },
    });
    expect(screen.getByLabelText("Output width")).toHaveValue(3.5);
    expect(screen.getByLabelText("Output height")).toHaveValue(4.5);
    fireEvent.change(screen.getByLabelText("Resolution (PPI)"), {
      target: { value: "600" },
    });
    expect(useImageCompression).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({
        output: expect.objectContaining({ width: 827, height: 1063 }),
      }),
      "local",
    );
  });

  it("pauses compression for invalid dimensions and restores ordinary compression when disabled", () => {
    renderTool();
    fireEvent.change(screen.getByLabelText("Output width"), {
      target: { value: "" },
    });
    expect(useImageCompression).toHaveBeenLastCalledWith(null, null, "local");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter positive dimensions",
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Set exact dimensions" }),
    );
    const settings = vi.mocked(useImageCompression).mock.lastCall?.[1];
    expect(settings).not.toBeNull();
    expect(settings).not.toHaveProperty("output");
  });

  it("supports keyboard composition, zoom and reset with a small source", () => {
    vi.mocked(useImageCompression).mockReturnValue({
      ...useImageCompression(null, null),
      source: {
        file: new File(["image"], "image.png"),
        url: "blob:source",
        bitmap: { width: 100, height: 100 } as ImageBitmap,
      },
    });
    renderTool();
    expect(screen.getByText(/This crop will be enlarged/)).toBeInTheDocument();
    fireEvent.keyDown(
      screen.getByRole("group", { name: "Reposition crop in preview" }),
      { key: "ArrowLeft" },
    );
    expect(useImageCompression).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ output: expect.objectContaining({ x: 0.51 }) }),
      "local",
    );
    fireEvent.change(screen.getByRole("slider", { name: "Zoom" }), {
      target: { value: "2" },
    });
    expect(useImageCompression).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ output: expect.objectContaining({ zoom: 2 }) }),
      "local",
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset crop" }));
    expect(useImageCompression).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({
        output: expect.objectContaining({ x: 0.5, y: 0.5, zoom: 1 }),
      }),
      "local",
    );
  });
});
