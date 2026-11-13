import {
  createTranslationPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/translate-prompt";
import { translateRequestSchema } from "@/schemas/translate";
import { errorResponse } from "@/utils/http";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(request: Request) {
  const { data: json } = await tryCatchAsync(() => request.json());
  const parsed = translateRequestSchema.safeParse(json);
  if (!parsed.success) return errorResponse("Invalid request data", 400);
  const { sourceText, sourceLang, targetLang } = parsed.data;

  const translation = tryCatch(() =>
    streamText({
      // A reasoning model: it takes no penalties, and its reasoning counts
      // towards maxOutputTokens.
      model: openai.responses("gpt-6-luna"),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: createTranslationPrompt(sourceLang, targetLang, sourceText),
        },
      ],
      maxOutputTokens: 4000,
    }),
  );
  if (translation.error) {
    console.error("Translation error:", translation.error);
    return errorResponse("Translation failed", 500);
  }
  return new Response(translation.data.textStream);
}
