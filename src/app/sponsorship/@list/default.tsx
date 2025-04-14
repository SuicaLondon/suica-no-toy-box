import { prefetchSponsorshipSearch } from "@/actions/prefetch-sponsorship-search";
import SponsorList from "@/lib/features/sponsorship/sponsor-list";

export default async function SponsorListPage({
  searchParams,
}: {
  searchParams: Promise<{ companyName?: string }>;
}) {
  const { companyName } = await searchParams;
  try {
    await prefetchSponsorshipSearch(companyName);
  } catch (error) {
    console.error(error);
  }

  return <SponsorList companyName={companyName} />;
}
