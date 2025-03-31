import { NextResponse } from 'next/server';
import { z } from 'zod';
import { openai } from '@/lib/config/openai';
import { translateRequestSchema } from '@/lib/schemas/translate';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sourceText, sourceLang, targetLang } = translateRequestSchema.parse(body);

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang}. Only respond with the translation, nothing else.`
                },
                {
                    role: "user",
                    content: sourceText
                }
            ],
            temperature: 0.3,
            max_tokens: 1000,
        });

        const translation = response.choices[0]?.message?.content || '';

        return NextResponse.json({ translation });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        console.error('Translation error:', error);
        return NextResponse.json(
            { error: 'Translation failed' },
            { status: 500 }
        );
    }
} 