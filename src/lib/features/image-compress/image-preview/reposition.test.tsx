import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToolI18nProvider } from "@/i18n/tool-i18n";
import type { CompressionSettings } from "../compression";
import { ImagePreview } from "./index";

vi.mock("./image-preview.module.css", () => ({
  default: { outputImage: "outputImage", loading: "loading" },
}));

beforeEach(() => {
  vi.stubGlobal(
    "PointerEvent",
    class extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
      }
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

const settings: CompressionSettings = {
  format: "jpeg",
  mode: "size",
  targetBytes: 10000,
  quality: 90,
  width: 16384,
  output: { width: 100, height: 100, ppi: 300, x: 0.5, y: 0.5, zoom: 1 },
};
const file = new File(["source"], "source.jpg");
const source = {
  file,
  url: "blob:source",
  bitmap: { width: 200, height: 100 } as ImageBitmap,
};
const result = {
  blob: new Blob(["result"]),
  url: "blob:result",
  width: 100,
  height: 100,
  quality: 90,
  elapsed: 0.1,
  settings,
  source,
  location: "local" as const,
};
const compression = {
  source,
  result,
  previousResult: result,
  error: "",
  estimate: null,
  remoteProgress: null,
  cancel: vi.fn(),
  retry: vi.fn(),
};

describe("preview crop repositioning", () => {
  it("drags the crop and comparison divider independently inside the preview", () => {
    const onReposition = vi.fn();
    render(
      <ToolI18nProvider locale="en">
        <ImagePreview
          file={file}
          settings={settings}
          format="jpeg"
          location="local"
          compression={compression}
          onUseLocal={vi.fn()}
          onReposition={onReposition}
        />
      </ToolI18nProvider>,
    );
    const preview = screen.getByRole("group", {
      name: "Reposition crop in preview",
    });
    preview.setPointerCapture = vi.fn();
    vi.spyOn(preview, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(preview, { clientX: 50, clientY: 50, button: 0 });
    fireEvent.pointerMove(preview, { clientX: 70, clientY: 80 });
    expect(onReposition).toHaveBeenLastCalledWith({ x: 0.3, y: 0.5 });
    fireEvent.pointerMove(preview, { clientX: 500, clientY: 80 });
    expect(onReposition).toHaveBeenLastCalledWith({ x: 0, y: 0.5 });
    fireEvent.pointerUp(preview);
    onReposition.mockClear();
    fireEvent.pointerMove(preview, { clientX: 10, clientY: 50 });
    expect(onReposition).not.toHaveBeenCalled();
    const compare = screen.getByRole("slider", {
      name: "Compare original and converted image",
    });
    expect(preview).toContainElement(compare);
    compare.setPointerCapture = vi.fn();
    fireEvent.pointerDown(compare, {
      pointerId: 2,
      clientX: 50,
      clientY: 50,
      button: 0,
    });
    fireEvent.pointerMove(compare, { pointerId: 2, clientX: 75, clientY: 50 });
    fireEvent.pointerUp(compare, { pointerId: 2 });
    expect(compare).toHaveAttribute("aria-valuenow", "75");
    fireEvent.keyDown(compare, { key: "ArrowLeft" });
    expect(compare).toHaveAttribute("aria-valuenow", "74");
    fireEvent.keyDown(compare, { key: "End" });
    expect(compare).toHaveAttribute("aria-valuenow", "100");
    expect(
      screen.getAllByRole("slider", {
        name: "Compare original and converted image",
      }),
    ).toHaveLength(1);
    expect(onReposition).not.toHaveBeenCalled();
  });

  it("zooms with the wheel and two touch pointers while clamping zoom", () => {
    const onReposition = vi.fn();
    render(
      <ToolI18nProvider locale="en">
        <ImagePreview
          file={file}
          settings={settings}
          format="jpeg"
          location="local"
          compression={compression}
          onUseLocal={vi.fn()}
          onReposition={onReposition}
        />
      </ToolI18nProvider>,
    );
    const preview = screen.getByRole("group", {
      name: "Reposition crop in preview",
    });
    preview.setPointerCapture = vi.fn();
    fireEvent.wheel(preview, { deltaY: -100 });
    expect(onReposition.mock.lastCall?.[0].zoom).toBeGreaterThan(1);
    fireEvent.wheel(preview, { deltaY: 10000 });
    expect(onReposition.mock.lastCall?.[0].zoom).toBe(1);
    fireEvent.pointerDown(preview, {
      pointerId: 1,
      clientX: 40,
      clientY: 50,
      button: 0,
    });
    fireEvent.pointerDown(preview, {
      pointerId: 2,
      clientX: 60,
      clientY: 50,
      button: 0,
    });
    fireEvent.pointerMove(preview, { pointerId: 2, clientX: 80, clientY: 50 });
    expect(onReposition).toHaveBeenLastCalledWith({ x: 0.5, y: 0.5, zoom: 2 });
    fireEvent.pointerCancel(preview, { pointerId: 1 });
    fireEvent.pointerCancel(preview, { pointerId: 2 });
    onReposition.mockClear();
    fireEvent.pointerMove(preview, { pointerId: 2, clientX: 100, clientY: 50 });
    expect(onReposition).not.toHaveBeenCalled();
  });

  it("shows the latest crop immediately instead of the old compressed result", () => {
    render(
      <ToolI18nProvider locale="en">
        <ImagePreview
          file={file}
          settings={{ ...settings, output: { ...settings.output!, x: 0.2 } }}
          format="jpeg"
          location="local"
          compression={{ ...compression, result: null }}
          onUseLocal={vi.fn()}
          onReposition={vi.fn()}
        />
      </ToolI18nProvider>,
    );
    expect(screen.getByAltText("Original image")).toHaveStyle({ left: "-20%" });
    expect(screen.queryByAltText("Converted image")).not.toBeInTheDocument();
    expect(screen.getByText("Download JPEG")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("supports arrow keys and returns to comparison-only mode when crop is disabled", () => {
    const onReposition = vi.fn();
    const { rerender } = render(
      <ToolI18nProvider locale="en">
        <ImagePreview
          file={file}
          settings={settings}
          format="jpeg"
          location="local"
          compression={compression}
          onUseLocal={vi.fn()}
          onReposition={onReposition}
        />
      </ToolI18nProvider>,
    );
    fireEvent.keyDown(
      screen.getByRole("group", { name: "Reposition crop in preview" }),
      { key: "ArrowLeft", shiftKey: true },
    );
    expect(onReposition).toHaveBeenCalledWith({ x: 0.6, y: 0.5 });
    const uncropped = { ...settings, output: undefined };
    rerender(
      <ToolI18nProvider locale="en">
        <ImagePreview
          file={file}
          settings={uncropped}
          format="jpeg"
          location="local"
          compression={{
            ...compression,
            result: { ...result, settings: uncropped },
          }}
          onUseLocal={vi.fn()}
          onReposition={onReposition}
        />
      </ToolI18nProvider>,
    );
    expect(
      screen.queryByRole("group", { name: "Reposition crop in preview" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("slider", {
        name: "Compare original and converted image",
      }),
    ).toHaveClass("absolute");
  });
});
