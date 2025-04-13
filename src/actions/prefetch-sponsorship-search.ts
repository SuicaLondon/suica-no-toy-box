import { searchSponsorship } from "@/clients/sponsorship-client";
import { QueryClient } from "@tanstack/react-query";

export async function prefetchSponsorshipSearch(companyName?: string) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["sponsorship", companyName],
    queryFn: () => {
      if (!companyName) {
        return Promise.resolve([]);
      }
      return searchSponsorship(companyName);
    },
    staleTime: 5 * 60 * 1000,
  });

  return queryClient;
}
