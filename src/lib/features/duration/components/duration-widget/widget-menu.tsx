import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent size-10 min-h-10 shrink-0 rounded-[2px] bg-transparent p-0 font-mono text-xs tracking-[0.08em] uppercase shadow-none"
            aria-label={durationCopy.menuLabel(widget.name)}
            title={durationCopy.menuLabel(widget.name)}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="border-toy-line-strong bg-toy-bg text-toy-text min-w-[190px] rounded-[2px] p-[5px] font-sans shadow-[0_18px_44px_rgb(0_0_0_/_14%)]"
          align="end"
        >
          <DropdownMenuItem
            className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
            variant="destructive"
            onSelect={() => setActiveDialog("delete")}
          >
            {durationCopy.deleteMenu}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
            onSelect={() => setActiveDialog("edit")}
          >
            {durationCopy.editMenu}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
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
