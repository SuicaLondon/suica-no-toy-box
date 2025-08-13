import { Button } from "@/components/ui/button";
import { memo } from "react";
import { useDurationStore } from "../../stores/duration.store";

export const CopyAllDurationsButton = memo(function CopyAllDurationsButton() {
  const copyAllWidgets = useDurationStore((state) => state.copyAllWidgets);
  return (
    <Button variant="outline" onClick={copyAllWidgets}>
      Copy Durations
    </Button>
  );
});
