"use client";
import { useQuery } from "@tanstack/react-query";
import { searchSponsorshipDetail } from "@/clients/sponsorship-client";

export const useSponsorshipDetail = (companyId: string | null) => {
  return useQuery({
    queryKey: ["sponsorshipDetail", companyId],
    queryFn: () => {
      if (!companyId) {
        return Promise.resolve(null);
      }
      return searchSponsorshipDetail(companyId);
    },
    enabled: !!companyId?.trim(),
    staleTime: 5 * 60 * 1000,
  });
};
