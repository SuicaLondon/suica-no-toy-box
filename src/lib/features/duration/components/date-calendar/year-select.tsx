import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToolI18n } from "@/i18n/tool-i18n";
import { memo, RefObject, useMemo, useState } from "react";
import styles from "../../duration.module.css";

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
        className={styles.yearTrigger}
        aria-label={copy.duration.selectYear}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        className={styles.menuContent}
        container={portalContainerRef?.current}
      >
        {yearOptions.map((year) => (
          <SelectItem
            className={styles.menuItem}
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
