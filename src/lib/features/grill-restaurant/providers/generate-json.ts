/**
 * One request for JSON that fits a schema, with no tools: what the verdict
 * and the translation ask for, from any provider. A Claude model may hand the
 * request to a fallback model when it declines on safety grounds; a refusal
 * that stands is reported as one.
 */
import { tryCatchAsync } from "@/utils/try-catch";
import { generateText, jsonSchema, Output, type JSONSchema7 } from "ai";
import { noOutputError } from "./errors";
import type { Models } from "./models";
import { tokenUsage, type TokenUsage } from "./pricing";

export type JsonRequest = {
  models: Models;
  model: string;
  prompt: string;
  /** The schema's name, for providers that take one. */
  name: string;
  schema: JSONSchema7;
};

export async function generateJson<T>(
  request: JsonRequest,
): Promise<{ value: T; usage: TokenUsage }> {
  const call = await tryCatchAsync(async () => {
    const result = await generateText({
      model: request.models.languageModel(request.model),
      prompt: request.prompt,
      output: Output.object({
        schema: jsonSchema<T>(request.schema),
        name: request.name,
      }),
      providerOptions: {
        anthropic: {
          fallbacks: "default",
          structuredOutputMode: "outputFormat",
        },
      },
    });
    return { value: result.output, usage: tokenUsage(result.totalUsage) };
  });
  if (call.error) throw noOutputError(call.error, request.model);
  return call.data;
}
