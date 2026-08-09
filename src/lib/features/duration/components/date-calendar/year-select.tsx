import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToolI18n } from "@/i18n/tool-i18n";
import { memo, RefObject, useMemo, useState } from "react";

interface YearSelectProps {
  portalContainerRef?: RefObject<HTMLDivElement | null>;
  currentDate: Date;
  handleYearChange: (year: number) => void;
}

export const YearSelect = memo(function YearSelect({
  portalContainerRef,
  currentDate,
  handleYearChange,
}: YearSelectProps) {
  const { copy } = useToolI18n();
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
      <SelectTrigger
        className="min-h-10 w-24 max-[420px]:w-[86px]"
        aria-label={copy.duration.selectYear}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        className="border-toy-line-strong bg-toy-bg text-toy-text min-w-[190px] rounded-[2px] p-[5px] font-sans shadow-[0_18px_44px_rgb(0_0_0_/_14%)]"
        container={portalContainerRef?.current}
      >
        {yearOptions.map((year) => (
          <SelectItem
            className="focus:bg-toy-hover focus:text-toy-accent min-h-[38px] cursor-pointer rounded-[1px]"
            key={year}
            value={year.toString()}
          >
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
