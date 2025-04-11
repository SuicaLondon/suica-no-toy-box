import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get("name");

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `https://suica.dev/api/sponsorship/${encodeURIComponent(companyName)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch sponsorship data");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Sponsorship search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsorship data" },
      { status: 500 },
    );
  }
}
