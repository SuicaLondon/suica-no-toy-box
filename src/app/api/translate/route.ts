import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { translateRequestSchema } from "@/lib/schemas/translate";
import { streamText } from "ai";
import {
  createTranslationPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/translate-promot";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceText, sourceLang, targetLang } =
      translateRequestSchema.parse(body);

    const { textStream } = streamText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: createTranslationPrompt(sourceLang, targetLang, sourceText),
        },
      ],
      maxTokens: 2000,
      presencePenalty: -0.1,
      frequencyPenalty: 0.1,
    });

    return new Response(textStream);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
