"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSponsorshipDetail } from "@/hooks/use-sponsorship-detail";
import { useSearchParams } from "next/navigation";
import SponsorDetailLoading from "../sponsor-detail-loading";
import SponsorDetailError from "../sponsor-detail-error";

export default function SponsorDetail() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("selectedCompanyId");
  const {
    data: companyDetail,
    isLoading,
    error,
  } = useSponsorshipDetail(companyId);

  if (!companyId) {
    return null;
  }

  if (isLoading) {
    return <SponsorDetailLoading />;
  }

  if (error) {
    return <SponsorDetailError error={error} />;
  }

  if (!companyDetail) {
    return <SponsorDetailError error={new Error("Company detail not found")} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
        <CardDescription>
          Comprehensive information about the company
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Website</h3>
          <a
            href={companyDetail.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {companyDetail.url}
          </a>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Description</h3>
          <p className="text-gray-600">{companyDetail.description}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Core Values</h3>
          <p className="text-gray-600">{companyDetail.values}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Business Model</h3>
          <p className="text-gray-600">{companyDetail.businessModel}</p>
        </div>
      </CardContent>
    </Card>
  );
}
