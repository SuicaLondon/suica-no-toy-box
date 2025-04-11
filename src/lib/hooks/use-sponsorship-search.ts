"use client";
import { useQuery } from "@tanstack/react-query";
import { searchSponsorship } from "@/lib/clients/sponsorship-client";

export const useSponsorshipSearch = (companyName?: string) => {
  return useQuery({
    queryKey: ["sponsorship", companyName],
    queryFn: () => {
      if (!companyName) {
        return Promise.resolve([]);
      }
      return searchSponsorship(companyName);
    },
    enabled: !!companyName?.trim(),
  });
};
