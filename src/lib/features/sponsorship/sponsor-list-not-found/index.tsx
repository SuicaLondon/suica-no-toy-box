import { Card, CardContent } from "suica-ui/card";
interface SponsorListNotFoundProps {
  companyName?: string;
}

export default function SponsorListNotFound({
  companyName,
}: SponsorListNotFoundProps) {
  return (
    <Card className="border-dashed text-center">
      <CardContent className="py-8">
        <p className="text-muted-foreground">
          {companyName
            ? `No results found for ${companyName}`
            : "No results found"}
        </p>
      </CardContent>
    </Card>
  );
}
