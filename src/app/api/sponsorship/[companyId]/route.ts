import {
  createCompanyUrlPrompt,
  createSponsorshipPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/sponsorship-promt";
import { prisma } from "@/prisma/prisma";
import { tryCatch } from "@/utils/try-catch";
import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

async function getCompanyDetail(companyName: string, url: string | undefined) {
  return generateObject({
    model: openai("gpt-4o"),
    system: SYSTEM_PROMPT,
    prompt: createSponsorshipPrompt(companyName, url),
    schema: z.object({
      url: z.string(),
      description: z.string(),
      values: z.string(),
      businessModel: z.string(),
    }),
  });
}

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

    if (company.hasUrl !== null && company.hasUrl !== undefined) {
      console.info("Company already has URL", company.name, company.url);
      return NextResponse.json({ data: company });
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      prompt: createCompanyUrlPrompt(company.name),
    });

    const { data: url, error } = tryCatch(() => new URL(text));

    const { object } = await getCompanyDetail(company.name, url?.toString());
    if (error) {
      console.error("Error: ", text, company.name);
      await prisma.company.update({
        where: { id: companyId },
        data: {
          hasUrl: false,
          url: null,
          description: object.description,
          values: object.values,
          businessModel: object.businessModel,
        },
      });
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    console.log(object);

    await prisma.company.update({
      where: { id: companyId },
      data: {
        hasUrl: true,
        url: url.toString(),
        description: object.description,
        values: object.values,
        businessModel: object.businessModel,
      },
    });

    console.info("Company updated successfully", company.name);
    return NextResponse.json({ data: { ...company, ...object } });
  } catch (error) {
    console.error("Company detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 },
    );
  }
}
