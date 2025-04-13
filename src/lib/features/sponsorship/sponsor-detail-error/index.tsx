import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SponsorDetailErrorProps = {
  error: Error;
};

export default function SponsorDetailError({ error }: SponsorDetailErrorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{error.message}</p>
      </CardContent>
    </Card>
  );
}
