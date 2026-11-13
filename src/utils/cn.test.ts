import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("keeps a theme text size next to a colour", () => {
    expect(cn("text-body text-toy-muted")).toBe("text-body text-toy-muted");
  });

  it("lets later theme tokens replace earlier ones of the same kind", () => {
    expect(cn("text-sm text-body")).toBe("text-body");
    expect(cn("rounded-xl rounded-panel")).toBe("rounded-panel");
    expect(cn("tracking-wide tracking-button")).toBe("tracking-button");
    expect(cn("font-semibold font-heading")).toBe("font-heading");
    expect(cn("max-w-md max-w-measure")).toBe("max-w-measure");
  });

  it("lets a condition swap a colour", () => {
    expect(cn("text-toy-muted", true && "text-toy-accent")).toBe(
      "text-toy-accent",
    );
  });
});
