import styles from "@/app/tool-shell.module.css";
import { memo } from "react";

type DinnerSelectionsProps = {
  options: string[];
  removeOption: (index: number) => void;
  removeLabel: (option: string) => string;
  disabled?: boolean;
};

export const DinnerSelections = memo(function DinnerSelections({
  options,
  removeOption,
  removeLabel,
  disabled,
}: DinnerSelectionsProps) {
  return (
    <div className={styles.chipList}>
      {options.map((option, index) => (
        <span key={`${option}-${index}`} className={styles.chip}>
          <span>{option}</span>
          <button
            type="button"
            onClick={() => removeOption(index)}
            aria-label={removeLabel(option)}
            title={removeLabel(option)}
            disabled={disabled}
          >
            <span aria-hidden="true">×</span>
          </button>
        </span>
      ))}
    </div>
  );
});
