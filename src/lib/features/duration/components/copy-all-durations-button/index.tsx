import { Button } from "@/components/ui/button";
import { useDurationStore } from "../../stores/duration.store";

export const CopyAllDurationsButton = () => {
  const copyAllWidgets = useDurationStore((state) => state.copyAllWidgets);
  return (
    <Button variant="outline" onClick={copyAllWidgets}>
      Copy Durations
    </Button>
  );
};
