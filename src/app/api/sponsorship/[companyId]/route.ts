import { createSponsorshipPrompt } from "@/lib/prompts/sponsorship-promt";
import { prisma } from "@/prisma/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ companyId: string }> },
) {
  try {
    const { companyId } = await params;

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      prompt: createSponsorshipPrompt(company.name),
      schema: z.object({
        url: z.string(),
        description: z.string(),
        values: z.string(),
        businessModel: z.string(),
      }),
    });

    return NextResponse.json({ data: { ...company, ...object } });
  } catch (error) {
    console.error("Company detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 },
    );
  }
}
