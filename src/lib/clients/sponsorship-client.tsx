import { Company } from "@prisma/client";

export const searchSponsorship = async (
  companyName: string,
): Promise<Omit<Company, "id" | "createdAt" | "updatedAt">[]> => {
  try {
    const response = await fetch(
      `/api/sponsorship?name=${encodeURIComponent(companyName)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch sponsorship data");
    }
    const data = await response.json();

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch sponsorship data");
  }
};
