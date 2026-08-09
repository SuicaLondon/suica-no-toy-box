export const ROULETTE_RADIUS = 150;

export const ROULETTE_COLORS = [
  "var(--roulette-1)",
  "var(--roulette-2)",
  "var(--roulette-3)",
  "var(--roulette-4)",
] as const;

function getCoordinates(degrees: number, distance = ROULETTE_RADIUS) {
  const radians = (degrees * Math.PI) / 180;

  return {
    x: ROULETTE_RADIUS + distance * Math.cos(radians),
    y: ROULETTE_RADIUS + distance * Math.sin(radians),
  };
}

export function getRouletteSegmentAngle(optionCount: number) {
  return 360 / optionCount;
}

export function getRouletteSegment(index: number, optionCount: number) {
  const angle = getRouletteSegmentAngle(optionCount);
  const startAngle = angle * index;
  const endAngle = angle * (index + 1);
  const start = getCoordinates(startAngle);
  const end = getCoordinates(endAngle);
  const label = getCoordinates(startAngle + angle / 2, ROULETTE_RADIUS * 0.6);

  return {
    label,
    path: `
      M ${ROULETTE_RADIUS},${ROULETTE_RADIUS}
      L ${start.x},${start.y}
      A ${ROULETTE_RADIUS},${ROULETTE_RADIUS} 0 ${angle > 180 ? 1 : 0} 1 ${end.x},${end.y}
      Z
    `,
  };
}
