import { Card, CardContent, CardHeader } from "suica-ui/card";
import { Skeleton } from "suica-ui/skeleton";

export default function SponsorDetailLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full" />
      </CardContent>
    </Card>
  );
}
