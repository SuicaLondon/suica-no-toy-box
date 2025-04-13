"use client";
import { useSearchParams } from "next/navigation";

export default function SponsorDetail() {
  const searchParams = useSearchParams();
  const selectedCompany = searchParams.get("selectedCompany");

  if (!selectedCompany) return null;

  return (
    <div>
      <h1>{selectedCompany} Sponsorship Detail</h1>
    </div>
  );
}
