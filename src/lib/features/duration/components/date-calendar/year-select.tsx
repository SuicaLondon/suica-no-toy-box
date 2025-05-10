import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { memo, RefObject, useMemo, useState } from "react";

type YearSelectProps = {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  currentDate: Date;
  handleYearChange: (year: number) => void;
};

export const YearSelect = memo(function YearSelect({
  portalContainerRef,
  currentDate,
  handleYearChange,
}: YearSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear + 100; i++) {
      years.push(i);
    }
    return years;
  }, []);

  return (
    <Select
      open={isOpen}
      onOpenChange={setIsOpen}
      value={currentDate.getFullYear().toString()}
      onValueChange={(value) => handleYearChange(parseInt(value))}
    >
      <SelectTrigger className="border-none shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent container={portalContainerRef?.current}>
        {yearOptions.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
