import React, { useEffect, useMemo, useRef, useState } from "react";

const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
  const lightness = 40 + Math.floor(Math.random() * 20); // 40-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

type DinnerRouletteProps = {
  options: string[];
  result: string;
  duration?: number;
  onSpinComplete?: () => void;
};

export const DinnerRoulette = ({
  options,
  result,
  duration = 5000,
  onSpinComplete,
}: DinnerRouletteProps) => {
  const radius = 150;
  const center = radius;
  const angle = 360 / options.length;
  const [rotation, setRotation] = useState(0);
  const svgRef = useRef<HTMLDivElement>(null);

  const colors = useMemo(
    () => options.map(() => generateRandomColor()),
    [options],
  );

  useEffect(() => {
    if (!result) return;

    const finalIndex = options.findIndex((s) => s === result);
    if (finalIndex === -1) return;

    const spins = 5;
    const targetAngle = (360 - (angle * finalIndex + angle / 2) + 270) % 360;

    const totalRotation = spins * 360 + targetAngle;
    setRotation(totalRotation);

    const timer = setTimeout(() => {
      onSpinComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [result, options, angle, duration, onSpinComplete]);

  const getCoordinates = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  return (
    <div className="relative flex items-center justify-center p-8">
      <div
        className="transition-transform duration-[5000ms] ease-out"
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: `${duration}ms`,
        }}
        ref={svgRef}
      >
        <svg
          width={radius * 2}
          height={radius * 2}
          className="rounded-full shadow-lg"
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
              <g key={index}>
                <path d={pathData} fill={colors[index] || "#000000"} />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold text-white"
                >
                  {option}
                </text>
              </g>
            );
          })}
          <circle cx={center} cy={center} r="5" fill="#000" />
        </svg>
      </div>

      <div className="absolute top-1/2 h-0 w-0 -translate-y-[150px] border-r-8 border-b-[20px] border-l-8 border-r-transparent border-b-black border-l-transparent" />
    </div>
  );
};
