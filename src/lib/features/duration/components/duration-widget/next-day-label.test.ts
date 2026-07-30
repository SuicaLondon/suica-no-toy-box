import { describe, expect, it } from "vitest";
import {
  formatCountdownTime,
  getTimeDifferenceObject,
} from "./get-time-difference-label";
import { getNextOccurrence } from "./next-day-label";

describe("duration recurrence calculations", () => {
  it("keeps a first occurrence that is still in the future", () => {
    const futureDate = new Date("2030-06-15T10:00:00.000Z");

    expect(
      getNextOccurrence(
        futureDate,
        "year",
        new Date("2026-06-15T10:00:00.000Z"),
      ),
    ).toEqual(futureDate);
  });

  it("advances a past weekly occurrence to the next future date", () => {
    expect(
      getNextOccurrence(
        new Date("2026-06-01T10:00:00.000Z"),
        "week",
        new Date("2026-06-10T10:00:00.000Z"),
      ),
    ).toEqual(new Date("2026-06-15T10:00:00.000Z"));
  });

  it("returns no next occurrence for a non-repeating date", () => {
    expect(
      getNextOccurrence(
        new Date("2026-06-01T10:00:00.000Z"),
        "never",
        new Date("2026-06-10T10:00:00.000Z"),
      ),
    ).toBeNull();
  });

  it("formats a stable countdown without negative units", () => {
    const countdown = getTimeDifferenceObject(
      new Date("2026-06-11T12:03:04.000Z"),
      new Date("2026-06-10T10:00:00.000Z"),
    );

    expect(countdown).toEqual({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
    });
    expect(
      formatCountdownTime(
        countdown.hours,
        countdown.minutes,
        countdown.seconds,
      ),
    ).toBe("02:03:04");
  });
});
