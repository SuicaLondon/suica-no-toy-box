import styles from "@/app/tool-shell.module.css";
import {
  memo,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const radius = 150;
const center = radius;

const colors = [
  "var(--roulette-1)",
  "var(--roulette-2)",
  "var(--roulette-3)",
  "var(--roulette-4)",
] as const;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

const getCoordinates = (deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad),
  };
};

type DinnerRouletteProps = {
  isSpinning: boolean;
  options: string[];
  result: string;
  duration?: number;
  onSpinComplete?: () => void;
  ariaLabel: string;
};

export const DinnerRoulette = memo(function DinnerRoulette({
  isSpinning,
  options,
  result,
  duration = 3000,
  onSpinComplete,
  ariaLabel,
}: DinnerRouletteProps) {
  const angle = 360 / options.length;
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
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
    <div className={`${styles.rouletteStage} ${styles.rouletteWheel}`}>
      <div className={styles.rouletteAssembly}>
        <div
          className={styles.rouletteRotation}
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${effectiveDuration}ms`,
          }}
        >
          <svg
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            className={styles.rouletteSvg}
            role="img"
            aria-label={ariaLabel}
          >
            {options.map((option, index) => {
              const startAngle = angle * index;
              const endAngle = angle * (index + 1);
              const largeArc = endAngle - startAngle > 180 ? 1 : 0;

              const start = getCoordinates(startAngle);
              const end = getCoordinates(endAngle);

              const pathData = `
                M ${center},${center}
                L ${start.x},${start.y}
                A ${radius},${radius} 0 ${largeArc} 1 ${end.x},${end.y}
                Z
              `;

              const midAngle = startAngle + angle / 2;
              const labelX =
                center + radius * 0.6 * Math.cos((midAngle * Math.PI) / 180);
              const labelY =
                center + radius * 0.6 * Math.sin((midAngle * Math.PI) / 180);

              return (
                <g key={option}>
                  <path
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="var(--home-bg)"
                    strokeWidth="1"
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={styles.rouletteText}
                  >
                    {option.length > 18 ? `${option.slice(0, 17)}…` : option}
                  </text>
                </g>
              );
            })}
            <circle cx={center} cy={center} r="6" fill="var(--home-accent)" />
          </svg>
        </div>

        <div className={styles.roulettePointer} aria-hidden="true" />
      </div>
    </div>
  );
});
