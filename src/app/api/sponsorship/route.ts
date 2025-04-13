import { load } from "cheerio";

import { NextResponse } from "next/server";
import { Company } from "@prisma/client";
import { parseCompanies } from "@/utils/parser";
import { prisma } from "@/prisma/prisma";

async function fetchCSVLink(): Promise<string | void> {
  try {
    const response = await fetch(
      "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers",
    );

    if (response.status !== 200) {
      throw new Error("Error occurred while fetching data");
    }
    const html = await response?.text();
    const $ = load(html);
    const linkElement = $(".gem-c-attachment__link").first();
    return $(linkElement).attr("href");
  } catch (error) {
    console.error(`fetch data Error: ${error}`);
    throw error;
  }
}

async function downloadData(url: string): Promise<string | void> {
  try {
    console.log(`download from ${url}`);
    const response = await fetch(url);
    return response.text();
  } catch (error) {
    console.log(`download data Error: ${error}`);
  }
}

async function fetchCompanies(): Promise<
  Omit<Company, "id" | "createdAt" | "updatedAt">[] | undefined
> {
  try {
    const link = await fetchCSVLink();
    if (!link) throw new Error("No link found");
    const data = await downloadData(link!);
    if (!data) throw new Error("No data found");
    return parseCompanies(data);
  } catch (error) {
    console.error(`download error: ${error}`);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("refresh")) {
      const companies = await fetchCompanies();
      if (!companies) {
        throw new Error("No companies data available");
      }
      await prisma.company.deleteMany();
      for (let i = 0; i < companies.length; i += 100) {
        const slicedCompanies = companies.slice(i, i + 100);
        await prisma.company.createMany({
          data: slicedCompanies,
        });
      }

      return NextResponse.json({ data: companies });
    }
    const companyName = searchParams.get("name");

    if (!companyName) {
      const companies = await prisma.company.findMany({
        take: 100,
      });
      return NextResponse.json({ data: companies });
    }
    const company = await prisma.company.findMany({
      where: {
        name: {
          contains: companyName,
          mode: "insensitive",
        },
      },
      take: 10,
    });
    return NextResponse.json({ data: company });
  } catch (error) {
    console.error("Sponsorship search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsorship data" },
      { status: 500 },
    );
  }
}
