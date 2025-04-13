import { prefetchSponsorshipSearch } from "@/actions/prefetch-sponsorship-search";
import SponsorList from "@/lib/features/sponsorship/sponsor-list";

export default function SponsorListPage({
  searchParams,
}: {
  searchParams: { companyName?: string };
}) {
  const companyName = searchParams.companyName;
  prefetchSponsorshipSearch(companyName);

  return <SponsorList companyName={companyName} />;
}
