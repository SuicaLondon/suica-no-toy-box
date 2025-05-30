import { load } from "cheerio";

import { prisma } from "@/prisma/prisma";
import { parseCompanies } from "@/utils/parser";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("refresh")) {
      console.time("fetch companies");

      const link = await fetchCSVLink();
      console.log("fetch CSV link success");
      console.timeLog("fetch companies");

      if (!link) throw new Error("No link found");

      const data = await downloadData(link!);
      console.log("download data success");
      console.timeLog("fetch companies");

      if (!data) throw new Error("No data found");
      console.log("parse companies success");
      console.timeLog("fetch companies");

      const companies = parseCompanies(data);
      if (!companies) {
        throw new Error("No companies data available");
      }
      await prisma.company.deleteMany();
      const tasks = [];
      for (let i = 0; i < companies.length; i += 1000) {
        const slicedCompanies = companies.slice(i, i + 1000);
        tasks.push(
          prisma.company.createMany({
            data: slicedCompanies,
          }),
        );
      }
      console.log(tasks.length);
      for (let i = 0; i < tasks.length; i += 10) {
        await Promise.all(tasks.slice(i, i + 10));
      }
      console.timeEnd("fetch companies");
      return NextResponse.json({ data: companies });
    }
    const companyName = searchParams.get("name");

    if (!companyName) {
      const companies = await prisma.company.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          county: true,
          type: true,
          rate: true,
        },
        take: 100,
      });
      return NextResponse.json({ data: companies });
    }
    const company = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        county: true,
        type: true,
        rate: true,
      },
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
