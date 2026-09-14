import { Button } from "suica-ui/button";
import { Select } from "suica-ui/select";
import { useToolI18n } from "@/i18n/tool-i18n";
import { ArrowDown, ArrowUp } from "lucide-react";
import { memo } from "react";
import { useDurationStore } from "../../stores/duration.store";

export const SortControls = memo(function SortControls() {
  const { copy } = useToolI18n();
  const durationCopy = copy.duration;
  const sortBy = useDurationStore((state) => state.sortBy);
  const sortDirection = useDurationStore((state) => state.sortDirection);
  const setSortBy = useDurationStore((state) => state.setSortBy);
  const setSortDirection = useDurationStore((state) => state.setSortDirection);

  return (
    <div className="flex items-center gap-2.5 max-[640px]:w-full max-[640px]:[&>*:first-child]:flex-auto">
      <Select
        value={sortBy}
        onChange={(event) => {
          const value = event.target.value;
          if (value === "date" || value === "name") setSortBy(value);
        }}
        aria-label={durationCopy.sortBy}
        className="min-h-11"
      >
        <option
          className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
          value="date"
        >
          {durationCopy.sortDate}
        </option>
        <option
          className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
          value="name"
        >
          {durationCopy.sortName}
        </option>
      </Select>
      <Button
        variant="outline"
        type="button"
        size="icon"
        className="size-10 min-h-10 shrink-0 p-0 font-mono text-xs tracking-[0.08em] uppercase"
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
