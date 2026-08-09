import {
  ROULETTE_COLORS,
  ROULETTE_RADIUS,
  getRouletteSegment,
} from "../roulette-geometry";

interface RouletteWheelSvgProps {
  ariaLabel: string;
  options: string[];
}

export function RouletteWheelSvg({
  ariaLabel,
  options,
}: RouletteWheelSvgProps) {
  return (
    <svg
      viewBox={`0 0 ${ROULETTE_RADIUS * 2} ${ROULETTE_RADIUS * 2}`}
      className="block h-auto w-full drop-shadow-[0_18px_34px_rgb(0_0_0_/_10%)]"
      role="img"
      aria-label={ariaLabel}
    >
      {options.map((option, index) => {
        const segment = getRouletteSegment(index, options.length);

        return (
          <g key={option}>
            <path
              d={segment.path}
              fill={ROULETTE_COLORS[index % ROULETTE_COLORS.length]}
              stroke="var(--toy-bg)"
              strokeWidth="1"
            />
            <text
              x={segment.label.x}
              y={segment.label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white [stroke:rgb(0_0_0_/_16%)] [stroke-width:0.8px] font-sans text-[0.72rem] font-[650] [paint-order:stroke]"
            >
              {option.length > 18 ? `${option.slice(0, 17)}…` : option}
            </text>
          </g>
        );
      })}
      <circle
        cx={ROULETTE_RADIUS}
        cy={ROULETTE_RADIUS}
        r="6"
        fill="var(--toy-accent)"
      />
    </svg>
  );
}
