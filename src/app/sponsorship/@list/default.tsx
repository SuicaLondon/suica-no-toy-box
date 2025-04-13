"use client";
import { useSearchParams } from "next/navigation";
import { useSponsorshipSearch } from "@/hooks/use-sponsorship-search";
import SponsorCard from "@/lib/features/sponsorship/sponsor-card";
import SponsorListError from "@/lib/features/sponsorship/sponsor-list-error";
import SponsorListNotFound from "@/lib/features/sponsorship/sponsor-list-not-found";
import SponsorListPlaceholder from "@/lib/features/sponsorship/sponsor-list-placeholder";

export default function SponsorList() {
  const searchParams = useSearchParams();
  const companyName = searchParams.get("companyName") || undefined;

  const {
    data: results,
    isLoading,
    error,
    isError,
  } = useSponsorshipSearch(companyName);

  if (!companyName) return null;

  if (isLoading) return <SponsorListPlaceholder />;

  if (isError) return <SponsorListError error={error} />;

  if (!!results && results.length === 0)
    return <SponsorListNotFound companyName={companyName} />;

  return (
    <div className="space-y-4">
      {results?.map((result, index) => (
        <SponsorCard
          key={index}
          name={result.name}
          city={result.city}
          county={result.county}
          type={result.type}
          rate={result.rate}
        />
      ))}
    </div>
  );
}
