import styles from "@/app/tool-shell.module.css";
import { memo } from "react";

type DinnerResultProps = {
  result: string;
  label: string;
  prefix: string;
};

export const DinnerResult = memo(function DinnerResult({
  result,
  label,
  prefix,
}: DinnerResultProps) {
  return (
    <div className={styles.resultCard} aria-live="polite">
      <span className={styles.metaLabel}>{label}</span>
      <strong>
        {prefix} {result}
      </strong>
    </div>
  );
});
