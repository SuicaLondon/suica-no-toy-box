import { Card, CardContent, CardHeader } from "suica-ui/card";
import { Skeleton } from "suica-ui/skeleton";

export default function SponsorListLoading() {
  return (
    <div className="space-y-4">
      {Array(3)
        .fill(null)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-8 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
