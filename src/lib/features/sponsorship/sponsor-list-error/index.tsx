import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type SponsorListErrorProps = {
  error: Error;
};

export default function SponsorListError({ error }: SponsorListErrorProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error instanceof Error
          ? error.message
          : "Failed to fetch results. Please try again."}
      </AlertDescription>
    </Alert>
  );
}
