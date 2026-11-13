"use client";

import { useRef } from "react";

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

/** Where the divider goes for a key, or null for keys the slider ignores. */
function nextSplit(key: string, split: number, step: number): number | null {
  switch (key) {
    case "Home":
      return 0;
    case "End":
      return 100;
    case "ArrowRight":
    case "ArrowUp":
      return clampPercent(split + step);
    case "ArrowLeft":
    case "ArrowDown":
      return clampPercent(split - step);
    default:
      return null;
  }
}

type ComparisonSliderProps = {
  /** Percent of the preview showing the original, from the left. */
  split: number;
  onSplit: (split: number) => void;
  label: string;
  /**
   * True when dragging the image moves the crop. The divider then becomes a
   * narrow handle that keeps its own pointer, so the two drags never mix.
   */
  draggableImage: boolean;
};

/** The divider between the original and the result. */
export function ComparisonSlider({
  split,
  onSplit,
  label,
  draggableImage,
}: ComparisonSliderProps) {
  const pointer = useRef<number | null>(null);

  if (!draggableImage) {
    return (
      <input
        type="range"
        aria-label={label}
        min="0"
        max="100"
        value={split}
        onChange={(event) => onSplit(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 focus-visible:opacity-30"
      />
    );
  }

  return (
    <div
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(split)}
      aria-orientation="horizontal"
      tabIndex={0}
      className="focus-visible:outline-toy-accent absolute inset-y-0 z-10 w-11 -translate-x-1/2 cursor-ew-resize touch-none focus-visible:outline-2"
      style={{ left: `${split}%` }}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (event.button !== 0) return;
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        event.stopPropagation();
        if (pointer.current !== event.pointerId) return;
        const frame =
          event.currentTarget.parentElement?.getBoundingClientRect();
        if (frame?.width) {
          onSplit(
            clampPercent(((event.clientX - frame.left) / frame.width) * 100),
          );
        }
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        pointer.current = null;
      }}
      onPointerCancel={(event) => {
        event.stopPropagation();
        pointer.current = null;
      }}
      onLostPointerCapture={() => {
        pointer.current = null;
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        const next = nextSplit(event.key, split, event.shiftKey ? 10 : 1);
        if (next === null) return;
        event.preventDefault();
        onSplit(next);
      }}
    />
  );
}
