"use client";
import { useSponsorshipSearch } from "@/hooks/use-sponsorship-search";
import SponsorCard from "../sponsor-card";
import SponsorListError from "../sponsor-list-error";
import SponsorListNotFound from "../sponsor-list-not-found";
import SponsorListLoading from "../sponsor-list-loading";

type SponsorListProps = {
  companyName?: string;
};

export default function SponsorList({ companyName }: SponsorListProps) {
  const { data: results, isLoading, error, isError } = useSponsorshipSearch();

  if (isLoading) return <SponsorListLoading />;

  if (isError) return <SponsorListError error={error} />;

  if (!!results && results.length === 0)
    return <SponsorListNotFound companyName={companyName} />;

  return (
    <div className="space-y-4">
      {results?.map((result, index) => (
        <SponsorCard
          key={index}
          id={result.id}
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
