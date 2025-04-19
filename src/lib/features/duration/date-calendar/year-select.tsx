import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { memo, useMemo } from "react";

type YearSelectProps = {
  currentDate: Date;
  handleYearChange: (year: number) => void;
};

export const YearSelect = memo(function YearSelect({
  currentDate,
  handleYearChange,
}: YearSelectProps) {
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
      value={currentDate.getFullYear().toString()}
      onValueChange={(value) => handleYearChange(parseInt(value))}
    >
      <SelectTrigger className="border-none shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {yearOptions.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
