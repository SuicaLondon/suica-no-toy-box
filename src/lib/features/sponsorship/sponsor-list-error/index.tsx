import { Alert } from "suica-ui/alert";
import { AlertCircle } from "lucide-react";

interface SponsorListErrorProps {
  error: Error;
}

export default function SponsorListError({ error }: SponsorListErrorProps) {
  return (
    <Alert
      variant="danger"
      className="mb-4"
      icon={<AlertCircle className="h-4 w-4" aria-hidden="true" />}
    >
      {error instanceof Error
        ? error.message
        : "Failed to fetch results. Please try again."}
    </Alert>
  );
}
