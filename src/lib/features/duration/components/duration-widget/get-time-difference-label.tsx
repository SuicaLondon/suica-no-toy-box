import { differenceInDays } from "date-fns/differenceInDays";
import { differenceInHours } from "date-fns/differenceInHours";
import { differenceInMinutes } from "date-fns/differenceInMinutes";
import { differenceInSeconds } from "date-fns/differenceInSeconds";

export function getTimeDifferenceObject(nextDate: Date, now: Date) {
  const days = differenceInDays(nextDate, now);
  const hours = differenceInHours(nextDate, now) - days * 24;
  const minutes =
    differenceInMinutes(nextDate, now) - days * 24 * 60 - hours * 60;
  const seconds =
    differenceInSeconds(nextDate, now) -
    days * 24 * 60 * 60 -
    hours * 60 * 60 -
    minutes * 60;
  return {
    days,
    hours,
    minutes,
    seconds,
  };
}
export function getAnniversaryLabel(nextDate: Date, now: Date) {
  const { days, hours, minutes, seconds } = getTimeDifferenceObject(
    nextDate,
    now,
  );

  return `Next anniversary is in ${days} days ${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getBirthdayLabel(nextDate: Date, now: Date) {
  const { days, hours, minutes, seconds } = getTimeDifferenceObject(
    nextDate,
    now,
  );

  return `Next birthday is in ${days} days ${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getBillsLabel(nextDate: Date, now: Date) {
  const { days } = getTimeDifferenceObject(nextDate, now);

  return `Next bill day is in ${days} days`;
}

export function getDefaultLabel(nextDate: Date, now: Date) {
  const { days } = getTimeDifferenceObject(nextDate, now);

  return `in ${days} days`;
}
