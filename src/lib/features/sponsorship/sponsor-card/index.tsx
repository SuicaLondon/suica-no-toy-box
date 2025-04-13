"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SponsorCardProps = {
  id: string;
  name: string;
  city: string;
  county: string;
  type: string;
  rate: string;
};

export default function SponsorCard({
  name,
  city,
  county,
  type,
  rate,
  id,
}: SponsorCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  params.set("selectedCompanyId", id);
  return (
    <Card
      className="transition-shadow hover:shadow-md"
      onClick={() => {
        router.replace(`${pathname}?${params.toString()}`);
      }}
    >
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{city}</Badge>
          {county && <Badge variant="outline">{county}</Badge>}
        </div>
        <p className="text-muted-foreground text-sm">Type: {type}</p>
      </CardContent>
      <CardFooter>
        <Badge variant="secondary">Rate: {rate}</Badge>
      </CardFooter>
    </Card>
  );
}
