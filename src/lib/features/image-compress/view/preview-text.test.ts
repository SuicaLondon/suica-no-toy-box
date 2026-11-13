import { imageCompressMessages } from "@/i18n/image-compress-messages";
import { describe, expect, it } from "vitest";
import {
  aspectRatioOf,
  downloadName,
  outputText,
  previewAction,
  previewStatus,
  savingsText,
} from "./preview-text";

const messages = imageCompressMessages.en;
const ready = {
  error: "",
  hasFile: true,
  hasSource: true,
  hasSettings: true,
  result: null,
  missedTarget: false,
  location: "local" as const,
  remoteProgress: null,
  estimate: null,
};

describe("previewStatus", () => {
  it("walks the steps before a result", () => {
    expect(previewStatus({ ...ready, error: "Boom" }, messages)).toBe(
      messages.stopped,
    );
    expect(previewStatus({ ...ready, hasFile: false }, messages)).toBe(
      messages.getStarted,
    );
    expect(previewStatus({ ...ready, hasSource: false }, messages)).toBe(
      messages.reading,
    );
    expect(previewStatus({ ...ready, hasSettings: false }, messages)).toBe(
      messages.checkSettings,
    );
  });

  it("estimates a pass on this device", () => {
    expect(previewStatus(ready, messages)).toBe(messages.estimating);
    expect(previewStatus({ ...ready, estimate: 4 }, messages)).toBe(
      `${messages.nextPass} 2–6 ${messages.seconds}`,
    );
  });

  it("follows a conversion on the server", () => {
    const remote = { ...ready, location: "remote" as const };
    expect(previewStatus(remote, messages)).toBe(messages.waiting);
    const phase = (
      phase: "uploading" | "processing" | "downloading",
      percent: number | null,
    ) =>
      previewStatus(
        { ...remote, remoteProgress: { phase, percent } },
        messages,
      );
    expect(phase("uploading", 40)).toBe(`${messages.uploading} · 40%`);
    expect(phase("uploading", null)).toBe(`${messages.uploading}…`);
    expect(phase("processing", null)).toBe(messages.converting);
    expect(phase("downloading", 75)).toBe(`${messages.downloading} · 75%`);
  });

  it("reports the result, or a missed size target", () => {
    const done = { ...ready, result: { elapsed: 1.234 } };
    expect(previewStatus(done, messages)).toBe(
      `${messages.ready} · ${messages.local} · 1.2 ${messages.seconds}`,
    );
    expect(previewStatus({ ...done, location: "remote" }, messages)).toBe(
      `${messages.ready} · ${messages.server} · 1.2 ${messages.seconds}`,
    );
    expect(previewStatus({ ...done, missedTarget: true }, messages)).toBe(
      messages.targetMissed,
    );
  });
});

describe("the preview's other lines", () => {
  it("labels the button by what it will do", () => {
    expect(previewAction(true, false, messages)).toBe(messages.cancel);
    expect(previewAction(false, true, messages)).toBe(messages.retry);
    expect(previewAction(false, false, messages)).toBe(messages.ready);
  });

  it("says how much smaller or larger the result is", () => {
    expect(savingsText(null, messages)).toBe(messages.awaiting);
    expect(savingsText(62.54, messages)).toBe(`62.5% ${messages.smaller}`);
    expect(savingsText(-5, messages)).toBe(`5.0% ${messages.larger}`);
  });

  it("describes the output format", () => {
    expect(outputText(null, messages)).toBe("—");
    expect(
      outputText({ quality: 80, settings: { format: "jpeg" } }, messages),
    ).toBe(`JPEG · ${messages.quality} 80`);
    expect(
      outputText({ quality: 100, settings: { format: "png" } }, messages),
    ).toBe(`PNG · ${messages.lossless}`);
  });

  it("names the download after the picked file", () => {
    const photo = new File(["x"], "holiday.photo.HEIC");
    expect(downloadName(null, "jpeg")).toBe("image");
    expect(downloadName(photo, "jpeg")).toBe("holiday.photo-converted.jpg");
    expect(downloadName(photo, "webp")).toBe("holiday.photo-converted.webp");
  });

  it("takes the shape of the crop, else the image", () => {
    expect(aspectRatioOf({ width: 400, height: 200 }, undefined)).toBe(2);
    expect(aspectRatioOf(undefined, { width: 300, height: 600 })).toBe(0.5);
    expect(aspectRatioOf(undefined, undefined)).toBe(1);
  });
});
