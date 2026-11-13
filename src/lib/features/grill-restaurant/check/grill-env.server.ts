/**
 * Grill Restaurant's settings, read from the environment (.env) and checked
 * with zod. Reading never throws: missing keys switch this one tool off and
 * name what is missing, so the rest of the site keeps working.
 */
import { z } from "zod";
import { providerOf } from "../providers/models";

/** An unset, empty or blank variable counts as not provided. */
const provided = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const required = z.preprocess(
  provided,
  z.string({ required_error: "is not set" }),
);
const optional = z.preprocess(provided, z.string().optional());

const grillEnvSchema = z
  .object({
    GEMINI_API_KEY: required,
    OPENAI_API_KEY: required,
    /** Only needed when SUMMARY_MODEL is a Claude model. */
    ANTHROPIC_API_KEY: optional,
    /** Model overrides; unset means each agent's own default. */
    GEMINI_MODEL: optional,
    OPENAI_MODEL: optional,
    SUMMARY_MODEL: optional,
    /** When set, a check needs this code. */
    GRILL_RESTAURANT_ACCESS_CODE: optional,
  })
  .superRefine((env, context) => {
    if (
      env.SUMMARY_MODEL &&
      providerOf(env.SUMMARY_MODEL) === "anthropic" &&
      !env.ANTHROPIC_API_KEY
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ANTHROPIC_API_KEY"],
        message: "is needed for a Claude SUMMARY_MODEL",
      });
    }
  })
  .transform((env) => ({
    /** What a check runs with, ready for startGrillRun. */
    providers: {
      geminiApiKey: env.GEMINI_API_KEY,
      openaiApiKey: env.OPENAI_API_KEY,
      anthropicApiKey: env.ANTHROPIC_API_KEY,
      geminiModel: env.GEMINI_MODEL,
      openaiModel: env.OPENAI_MODEL,
      summaryModel: env.SUMMARY_MODEL,
    },
    accessCode: env.GRILL_RESTAURANT_ACCESS_CODE,
  }));

export type GrillEnv = z.output<typeof grillEnvSchema>;

/**
 * Reads the settings, or lists what is wrong with them by variable name.
 * Values are never repeated, so the list is safe to log.
 */
export function readGrillEnv(
  source: Record<string, string | undefined> = process.env,
): { ok: true; env: GrillEnv } | { ok: false; problems: string[] } {
  const parsed = grillEnvSchema.safeParse(source);
  if (parsed.success) return { ok: true, env: parsed.data };
  return {
    ok: false,
    problems: parsed.error.issues.map(
      (issue) => `${issue.path.join(".")} ${issue.message}`,
    ),
  };
}
