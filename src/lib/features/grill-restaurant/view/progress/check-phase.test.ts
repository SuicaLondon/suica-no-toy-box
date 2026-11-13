import { describe, expect, it } from "vitest";
import { checkPhase, frozenTime } from "./check-phase";

describe("checkPhase", () => {
  it.each([
    [{ status: "running", cancelled: false }, "live"],
    [{ status: "done", cancelled: false }, "done"],
    [{ status: "running", cancelled: true }, "stopped"],
    [{ status: "failed", cancelled: false }, "lost"],
  ] as const)("reads %j as %s", (state, phase) => {
    expect(checkPhase(state)).toBe(phase);
  });
});

describe("frozenTime", () => {
  it("freezes where the check was stopped, or at the last event if cut off", () => {
    expect(frozenTime("stopped", 31_000, 30_500)).toBe(31_000);
    expect(frozenTime("stopped", null, 30_500)).toBe(30_500);
    expect(frozenTime("lost", null, 30_500)).toBe(30_500);
  });

  it("does not freeze a live or finished check", () => {
    expect(frozenTime("live", 31_000, 30_500)).toBeNull();
    expect(frozenTime("done", null, 30_500)).toBeNull();
  });
});
