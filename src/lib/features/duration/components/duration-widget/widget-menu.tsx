import { Button } from "suica-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "suica-ui/dropdown-menu";
import { useToolI18n } from "@/i18n/tool-i18n";
import { MoreHorizontal } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { useDurationStore } from "../../stores/duration.store";
import { DurationWidget } from "../../type/duration.type";
import { DeleteDurationDialog } from "../delete-duration-dialog";
import { EditDurationDialog } from "../edit-duration-dialog";
interface WidgetMenuProps {
  widget: DurationWidget;
}

export const WidgetMenu = memo(function WidgetMenu({
  widget,
}: WidgetMenuProps) {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const [activeDialog, setActiveDialog] = useState<"delete" | "edit" | null>(
    null,
  );
  const copyWidget = useDurationStore((state) => state.copyWidget);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(props) => (
            <Button
              variant="outline"
              {...props}
              type="button"
              size="icon"
              className="size-10 min-h-10 shrink-0 p-0 font-mono text-xs tracking-[0.08em] uppercase"
              aria-label={durationCopy.menuLabel(widget.name)}
              title={durationCopy.menuLabel(widget.name)}
            />
          )}
        >
          <MoreHorizontal aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-[190px] p-[5px] font-sans"
          align="end"
        >
          <DropdownMenuItem
            className="text-danger focus:text-danger min-h-[38px] cursor-pointer"
            data-variant="destructive"
            onSelect={() => setActiveDialog("delete")}
          >
            {durationCopy.deleteMenu}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-[38px] cursor-pointer"
            onSelect={() => setActiveDialog("edit")}
          >
            {durationCopy.editMenu}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-[38px] cursor-pointer"
            onSelect={() => void handleCopy()}
          >
            {durationCopy.copyMenu}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDurationDialog
        open={activeDialog === "delete"}
        setOpen={() => setActiveDialog(null)}
        widget={widget}
      />
      <EditDurationDialog
        open={activeDialog === "edit"}
        setOpen={() => setActiveDialog(null)}
        id={widget.id}
        name={widget.name}
        date={widget.date}
        type={widget.type}
        repeat={widget.repeat}
      />
    </>
  );

  async function handleCopy() {
    try {
      await copyWidget(widget);
      toast.success(durationCopy.copiedOne);
    } catch {
      toast.error(durationCopy.copyFailed);
    }
  }
});
