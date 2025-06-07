import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDurationStore } from "../../stores/duration.store";

export const CopyAllDurationsButton = () => {
  const durations = useDurationStore((state) => state.widgets);
  const handleCopy = () => {
    const durationsString = JSON.stringify(durations);
    navigator.clipboard.writeText(durationsString);
    toast.success("Durations copied to clipboard");
  };
  return (
    <Button variant="outline" onClick={handleCopy}>
      Copy Durations
    </Button>
  );
};
