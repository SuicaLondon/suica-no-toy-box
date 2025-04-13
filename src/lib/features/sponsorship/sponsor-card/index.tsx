import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SponsorCardProps = {
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
}: SponsorCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{city}</Badge>
          <Badge variant="outline">{county}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Type: {type}</p>
      </CardContent>
      <CardFooter>
        <Badge variant="secondary">Rate: {rate}</Badge>
      </CardFooter>
    </Card>
  );
}
