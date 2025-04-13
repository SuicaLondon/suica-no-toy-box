import { prefetchSponsorshipDetail } from "@/actions/prefetch-sponsorship-detail";
import SponsorDetail from "@/lib/features/sponsorship/sponsor-detail";

export default async function SponsorDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId: string }>;
}) {
  const { companyId } = await searchParams;
  await prefetchSponsorshipDetail(companyId);
  return <SponsorDetail />;
}
