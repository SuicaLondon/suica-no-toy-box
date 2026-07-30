"use client";
import { useQuery } from "@tanstack/react-query";
import { searchSponsorship } from "@/clients/sponsorship-client";

export const useSponsorshipSearch = (name?: string | null) => {
  const companyName = name?.trim() || undefined;

  return useQuery({
    queryKey: ["sponsorship", companyName],
    queryFn: () => {
      if (!companyName) {
        return Promise.resolve([]);
      }
      return searchSponsorship(companyName);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!companyName?.trim(),
  });
};
