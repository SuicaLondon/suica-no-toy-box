import toolStyles from "@/app/tool-shell.module.css";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToolI18n } from "@/i18n/tool-i18n";
import { ArrowDown, ArrowUp } from "lucide-react";
import { memo } from "react";
import styles from "../../duration.module.css";
import { useDurationStore } from "../../stores/duration.store";

export const SortControls = memo(function SortControls() {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const sortBy = useDurationStore((state) => state.sortBy);
  const sortDirection = useDurationStore((state) => state.sortDirection);
  const setSortBy = useDurationStore((state) => state.setSortBy);
  const setSortDirection = useDurationStore((state) => state.setSortDirection);

  return (
    <div className={styles.sortControls}>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger
          className={toolStyles.selectTrigger}
          aria-label={durationCopy.sortBy}
        >
          <SelectValue placeholder={durationCopy.sortBy} />
        </SelectTrigger>
        <SelectContent className={styles.menuContent}>
          <SelectItem className={styles.menuItem} value="date">
            {durationCopy.sortDate}
          </SelectItem>
          <SelectItem className={styles.menuItem} value="name">
            {durationCopy.sortName}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        size="icon"
        className={toolStyles.iconButton}
        onClick={() =>
          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        }
        aria-label={
          sortDirection === "asc"
            ? durationCopy.ascending
            : durationCopy.descending
        }
        title={
          sortDirection === "asc"
            ? durationCopy.ascending
            : durationCopy.descending
        }
      >
        {sortDirection === "asc" ? (
          <ArrowUp aria-hidden="true" />
        ) : (
          <ArrowDown aria-hidden="true" />
        )}
      </Button>
    </div>
  );
});
