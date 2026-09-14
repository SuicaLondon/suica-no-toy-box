import { Alert } from "suica-ui/alert";

interface SponsorDetailErrorProps {
  error: Error;
}
export default function SponsorDetailError({ error }: SponsorDetailErrorProps) {
  return (
    <Alert variant="danger" title="Error">
      {error.message}
    </Alert>
  );
}
