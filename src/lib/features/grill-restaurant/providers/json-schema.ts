/**
 * Builders for the JSON schemas the agents' structured output takes. Strict
 * mode needs every property listed as required and no others allowed, which
 * strictObject does.
 */
import type { JSONSchema7 } from "ai";

export const text: JSONSchema7 = { type: "string" };
export const integer: JSONSchema7 = { type: "integer" };
export const boolean: JSONSchema7 = { type: "boolean" };

/** A value of this type, or null. */
export function nullable(type: "string" | "number" | "integer"): JSONSchema7 {
  return { type: [type, "null"] };
}

/** An array of `items`, optionally capped at `maxItems`. */
export function list(items: JSONSchema7, maxItems?: number): JSONSchema7 {
  if (maxItems === undefined) return { type: "array", items };
  return { type: "array", items, maxItems };
}

/** One of these strings. */
export function oneOf(...values: string[]): JSONSchema7 {
  return { type: "string", enum: values };
}

/** An object with exactly these properties, all of them required. */
export function strictObject(
  properties: Record<string, JSONSchema7>,
): JSONSchema7 {
  return {
    type: "object",
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  };
}
