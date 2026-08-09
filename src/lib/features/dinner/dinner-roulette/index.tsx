import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { memo, useEffect, useMemo, useState } from "react";
import { getRouletteSegmentAngle } from "../roulette-geometry";
import { RouletteWheelSvg } from "./roulette-wheel-svg";

interface DinnerRouletteProps {
  isSpinning: boolean;
  options: string[];
  result: string;
  duration?: number;
  onSpinComplete?: () => void;
  ariaLabel: string;
}

export const DinnerRoulette = memo(function DinnerRoulette({
  isSpinning,
  options,
  result,
  duration = 3000,
  onSpinComplete,
  ariaLabel,
}: DinnerRouletteProps) {
  const angle = getRouletteSegmentAngle(options.length);
  const prefersReducedMotion = usePrefersReducedMotion();
  const effectiveDuration = prefersReducedMotion ? 1 : duration;

  const [rotation, setRotation] = useState(0);
  const resultIndex = useMemo(
    () => options.findIndex((s) => s === result),
    [options, result],
  );

  useEffect(() => {
    if (!result) return;
    if (resultIndex === -1) return;
    if (!isSpinning) return;

    const targetAngle = (360 - (angle * resultIndex + angle / 2) + 270) % 360;

    setRotation((currentRotation) => {
      const delta = (targetAngle - (currentRotation % 360) + 360) % 360;
      return currentRotation + 5 * 360 + delta;
    });

    const timer = setTimeout(() => {
      onSpinComplete?.();
    }, effectiveDuration);

    return () => clearTimeout(timer);
  }, [
    result,
    effectiveDuration,
    onSpinComplete,
    isSpinning,
    resultIndex,
    angle,
  ]);

  return (
    <div className="border-toy-line bg-toy-hover relative flex min-h-[356px] items-center justify-center overflow-hidden border [--roulette-1:color-mix(in_srgb,var(--toy-accent)_85%,var(--toy-bg))] [--roulette-2:color-mix(in_srgb,var(--toy-accent)_58%,var(--toy-bg))] [--roulette-3:color-mix(in_srgb,var(--toy-accent)_36%,var(--toy-bg))] [--roulette-4:color-mix(in_srgb,var(--toy-accent)_70%,var(--toy-text))] max-[767px]:min-h-[310px]">
      <div className="relative w-[min(300px,calc(100vw-96px))]">
        <div
          className="w-full transition-transform [transition-timing-function:cubic-bezier(0.16,0.76,0.2,1)] motion-reduce:!duration-[1ms]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${effectiveDuration}ms`,
          }}
        >
          <RouletteWheelSvg options={options} ariaLabel={ariaLabel} />
        </div>

        <div
          className="border-t-toy-accent absolute top-0.5 left-1/2 size-0 -translate-x-1/2 border-t-[16px] border-r-[10px] border-l-[10px] border-r-transparent border-l-transparent drop-shadow-[0_2px_3px_rgb(0_0_0_/_18%)]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
});
