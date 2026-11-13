import { grillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { describe, expect, it } from "vitest";
import { initialGrillState } from "../../check/grill-state";
import { CONNECTION_LOST, type GrillRunView } from "../../hooks/use-grill-run";
import { composerProblem } from "./composer-problem";

const messages = grillRestaurantMessages.en;
const idle: GrillRunView = {
  ...initialGrillState(),
  streaming: false,
  cancelled: false,
};
const refused = (status: number, message = "Nope.") => ({
  ...idle,
  requestError: { status, message },
});

describe("composerProblem", () => {
  it("says nothing before a check", () => {
    expect(composerProblem(idle, null, messages)).toEqual({
      message: null,
      needsCode: false,
    });
  });

  it("asks for an access code, and only complains once one was wrong", () => {
    expect(composerProblem(refused(401), null, messages)).toEqual({
      message: null,
      needsCode: true,
    });
    const tried = { kind: "live", url: "x", accessCode: "guess" } as const;
    expect(composerProblem(refused(401), tried, messages)).toEqual({
      message: messages.accessCodeWrong,
      needsCode: true,
    });
  });

  it("words the server's refusals", () => {
    expect(composerProblem(refused(503), null, messages).message).toBe(
      messages.notConfigured,
    );
    expect(composerProblem(refused(0), null, messages).message).toBe(
      messages.offline,
    );
    expect(
      composerProblem(refused(500, CONNECTION_LOST), null, messages).message,
    ).toBe(messages.offline);
    expect(
      composerProblem(refused(400, "Bad link."), null, messages).message,
    ).toBe("Bad link.");
  });

  it("explains a link that could not start a check", () => {
    const failed = {
      ...idle,
      status: "failed",
      error: "x",
      errorCode: "unreachable",
    } as const;
    expect(composerProblem(failed, null, messages).message).toBe(
      messages.linkErrors.unreachable,
    );
  });
});
