import {
  createCompanyUrlPrompt,
  createSponsorshipPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/sponsorship-promt";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { companies } from "@/db/schema";
import { errorResponse } from "@/utils/http";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

async function getCompanyDetail(companyName: string, url: string | undefined) {
  const { output } = await generateText({
    model: openai.chat("gpt-4o"),
    system: SYSTEM_PROMPT,
    prompt: createSponsorshipPrompt(companyName, url),
    output: Output.object({
      schema: z.object({
        url: z.string(),
        description: z.string(),
        values: z.string(),
        businessModel: z.string(),
      }),
    }),
  });
  return output;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ companyId: string }> },
) {
  const { companyId } = await params;
  const detail = await tryCatchAsync(() => companyDetail(companyId));
  if (detail.error) {
    console.error("Company detail error:", detail.error);
    return errorResponse("Failed to fetch company details", 500);
  }
  return detail.data;
}

/** The company's details, looked up and saved on the first request. */
async function companyDetail(companyId: string): Promise<Response> {
  const company = await db.query.companies.findFirst({
    where: (company, { eq }) => eq(company.id, companyId),
  });

  if (!company) {
    return errorResponse("Company not found", 404);
  }

  if (company.hasUrl !== null && company.hasUrl !== undefined) {
    console.info("Company already has URL", company.name, company.url);
    return NextResponse.json({ data: company });
  }

  const { text } = await generateText({
    model: openai.chat("gpt-4o"),
    system: SYSTEM_PROMPT,
    prompt: createCompanyUrlPrompt(company.name),
  });

  const { data: url, error } = tryCatch(() => new URL(text));

  const object = await getCompanyDetail(company.name, url?.toString());
  if (error) {
    console.error("Error: ", text, company.name);
    await db
      .update(companies)
      .set({
        hasUrl: false,
        url: null,
        description: object.description,
        values: object.values,
        businessModel: object.businessModel,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId));
    return errorResponse("Company not found", 404);
  }

  console.log(object);

  await db
    .update(companies)
    .set({
      hasUrl: true,
      url: url.toString(),
      description: object.description,
      values: object.values,
      businessModel: object.businessModel,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId));

  console.info("Company updated successfully", company.name);
  return NextResponse.json({ data: { ...company, ...object } });
}
