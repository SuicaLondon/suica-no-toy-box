import toolStyles from "@/app/tool-shell.module.css";
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
import styles from "../../duration.module.css";
import { useDurationStore } from "../../stores/duration.store";
import { DurationWidget } from "../../type/duration.type";
import { DeleteDurationDialog } from "../delete-duration-dialog";
import { EditDurationDialog } from "../edit-duration-dialog";
type WidgetMenuProps = {
  widget: DurationWidget;
};

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
            className={`${toolStyles.iconButton} ${styles.menuTrigger}`}
            aria-label={durationCopy.menuLabel(widget.name)}
            title={durationCopy.menuLabel(widget.name)}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={styles.menuContent} align="end">
          <DropdownMenuItem
            className={styles.menuItem}
            variant="destructive"
            onSelect={() => setActiveDialog("delete")}
          >
            {durationCopy.deleteMenu}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={styles.menuItem}
            onSelect={() => setActiveDialog("edit")}
          >
            {durationCopy.editMenu}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={styles.menuItem}
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
