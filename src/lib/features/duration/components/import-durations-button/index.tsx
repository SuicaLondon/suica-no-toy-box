import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memo } from "react";
import { useDurationStore } from "../../stores/duration.store";

export const ImportDurationsButton = memo(function ImportDurationsButton() {
  const importWidgetFromClipboard = useDurationStore(
    (state) => state.importWidgetFromClipboard,
  );
  const importWidgetsFromClipboard = useDurationStore(
    (state) => state.importWidgetsFromClipboard,
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Import Durations</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={importWidgetFromClipboard}>
          Import single widget from clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={importWidgetsFromClipboard}>
          Import multiple widgets from clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
