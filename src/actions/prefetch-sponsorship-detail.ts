import { searchSponsorshipDetail } from "@/clients/sponsorship-client";
import { QueryClient } from "@tanstack/react-query";

export async function prefetchSponsorshipDetail(companyId: string) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["sponsorshipDetail", companyId],
    queryFn: () => {
      if (!companyId) {
        return Promise.resolve(null);
      }
      return searchSponsorshipDetail(companyId);
    },
    staleTime: 5 * 60 * 1000,
  });

  return queryClient;
}
