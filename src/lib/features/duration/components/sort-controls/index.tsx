import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDown, ArrowUp } from "lucide-react";
import { memo } from "react";
import { useDurationStore } from "../../stores/duration.store";

export const SortControls = memo(function SortControls() {
  const sortBy = useDurationStore((state) => state.sortBy);
  const sortDirection = useDurationStore((state) => state.sortDirection);
  const setSortBy = useDurationStore((state) => state.setSortBy);
  const setSortDirection = useDurationStore((state) => state.setSortDirection);

  return (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() =>
          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        }
      >
        {sortDirection === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
});
