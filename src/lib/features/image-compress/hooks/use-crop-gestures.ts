"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { cropRectangle, type OutputSize } from "../compression/crop";

export type CropPosition = { x: number; y: number; zoom?: number };
const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

/** WheelEvent.deltaMode values. */
const DELTA_LINE = 1;
const DELTA_PAGE = 2;

/** A wheel turn in pixels, whether the device reports pixels, lines or pages. */
function wheelPixels(event: WheelEvent, pageHeight: number): number {
  if (event.deltaMode === DELTA_LINE) return event.deltaY * 16;
  if (event.deltaMode === DELTA_PAGE) return event.deltaY * pageHeight;
  return event.deltaY;
}

export function zoomCrop(
  width: number,
  height: number,
  output: OutputSize,
  zoom: number,
) {
  const before = cropRectangle(width, height, output);
  const next = { ...output, zoom: clamp(zoom, 1, 10) };
  const after = cropRectangle(width, height, next);
  return {
    zoom: next.zoom,
    x:
      width === after.width
        ? 0.5
        : clamp(
            (before.left + before.width / 2 - after.width / 2) /
              (width - after.width),
          ),
    y:
      height === after.height
        ? 0.5
        : clamp(
            (before.top + before.height / 2 - after.height / 2) /
              (height - after.height),
          ),
  };
}

export function useCropGestures(
  width: number,
  height: number,
  output: OutputSize | undefined,
  onChange?: (position: CropPosition) => void,
) {
  const ref = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    output: OutputSize;
    centerX: number;
    centerY: number;
    distance: number;
    scaleX: number;
    scaleY: number;
  } | null>(null);
  const enabled = Boolean(output && onChange);

  useEffect(() => {
    const element = ref.current;
    if (!element || !output || !onChange) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = wheelPixels(event, element.clientHeight);
      onChange(
        zoomCrop(width, height, output, output.zoom * Math.exp(-delta * 0.002)),
      );
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [width, height, output, onChange]);

  useEffect(() => {
    if (!enabled) {
      pointers.current.clear();
      gesture.current = null;
    }
  }, [enabled]);

  function measure() {
    const points = [...pointers.current.values()];
    const first = points[0];
    const second = points[1] ?? first;
    return first
      ? {
          centerX: (first.x + second.x) / 2,
          centerY: (first.y + second.y) / 2,
          distance:
            points.length > 1
              ? Math.hypot(first.x - second.x, first.y - second.y)
              : 0,
        }
      : null;
  }
  function begin() {
    const current = measure();
    const frame = ref.current?.getBoundingClientRect();
    if (!current || !output || !frame) {
      gesture.current = null;
      return;
    }
    const crop = cropRectangle(width, height, output);
    gesture.current = {
      ...current,
      output,
      scaleX: ((width - crop.width) * frame.width) / crop.width,
      scaleY: ((height - crop.height) * frame.height) / crop.height,
    };
  }
  function finish(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    begin();
  }
  return {
    ref,
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (!enabled || event.button !== 0 || pointers.current.size >= 2) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      pointers.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      begin();
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      if (!enabled || !pointers.current.has(event.pointerId)) return;
      pointers.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      const current = measure();
      const start = gesture.current;
      if (!current || !start || !onChange) return;
      if (start.distance && current.distance) {
        onChange(
          zoomCrop(
            width,
            height,
            start.output,
            (start.output.zoom * current.distance) / start.distance,
          ),
        );
      } else {
        onChange({
          x: clamp(
            start.output.x -
              (start.scaleX
                ? (current.centerX - start.centerX) / start.scaleX
                : 0),
          ),
          y: clamp(
            start.output.y -
              (start.scaleY
                ? (current.centerY - start.centerY) / start.scaleY
                : 0),
          ),
        });
      }
    },
    onPointerUp: finish,
    onPointerCancel: finish,
    onLostPointerCapture: finish,
  };
}
