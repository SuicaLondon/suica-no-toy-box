import { differenceInSeconds } from "date-fns/differenceInSeconds";

export function getTimeDifferenceObject(nextDate: Date, now: Date) {
  const totalSeconds = Math.max(0, differenceInSeconds(nextDate, now));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

export function formatCountdownTime(
  hours: number,
  minutes: number,
  seconds: number,
) {
  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}
