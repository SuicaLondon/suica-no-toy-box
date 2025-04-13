import { Company } from "@prisma/client";

type SponsorshipDetail = Company & {
  url: string;
  description: string;
  values: string;
  businessModel: string;
};

export const searchSponsorship = async (
  companyName: string,
): Promise<Company[]> => {
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

export const searchSponsorshipDetail = async (
  companyId: string,
): Promise<SponsorshipDetail> => {
  const response = await fetch(`/api/sponsorship/${companyId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch company details");
  }

  const json = await response.json();

  return json.data;
};

export interface CompanyDetail {
  url: string;
  description: string;
  values: string;
  businessModel: string;
}

export const searchCompanyDetail = async (
  companyId: string,
): Promise<CompanyDetail> => {
  const response = await fetch(`/api/sponsorship/${companyId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch company details");
  }

  return response.json();
};
