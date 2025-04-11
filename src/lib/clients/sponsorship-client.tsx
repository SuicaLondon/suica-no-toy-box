interface SponsorResult {
  name: string;
  city: string;
  county: string;
  type: string;
  rate: string;
}

export const searchSponsorship = async (
  companyName: string,
): Promise<SponsorResult[]> => {
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
