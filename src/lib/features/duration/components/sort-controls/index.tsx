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
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger
          className="border-toy-line-strong text-toy-text focus-visible:border-toy-accent focus-visible:ring-toy-accent min-h-11 w-full justify-between rounded-[2px] bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-offset-2"
          aria-label={durationCopy.sortBy}
        >
          <SelectValue placeholder={durationCopy.sortBy} />
        </SelectTrigger>
        <SelectContent className="border-toy-line-strong bg-toy-bg text-toy-text min-w-[190px] rounded-[2px] p-[5px] font-sans shadow-[0_18px_44px_rgb(0_0_0_/_14%)]">
          <SelectItem
            className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
            value="date"
          >
            {durationCopy.sortDate}
          </SelectItem>
          <SelectItem
            className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
            value="name"
          >
            {durationCopy.sortName}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        size="icon"
        className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent size-10 min-h-10 shrink-0 rounded-[2px] bg-transparent p-0 font-mono text-xs tracking-[0.08em] uppercase shadow-none"
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
