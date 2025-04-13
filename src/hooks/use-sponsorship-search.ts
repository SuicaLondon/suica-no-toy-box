"use client";
import { useQuery } from "@tanstack/react-query";
import { searchSponsorship } from "@/clients/sponsorship-client";
import { useSearchParams } from "next/navigation";

export const useSponsorshipSearch = () => {
  const searchParams = useSearchParams();
  const companyName = searchParams.get("companyName") || undefined;
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
