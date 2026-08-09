import { useToolI18n } from "@/i18n/tool-i18n";
import { RepeatOptionType, TypeOptionType } from "@/schemas/duration";
import { memo } from "react";

interface TypeLabelProps {
  type?: TypeOptionType;
  repeat?: RepeatOptionType;
}

export const TypeLabel = memo(function TypeLabel({
  type,
  repeat,
}: TypeLabelProps) {
  const { copy } = useToolI18n();
  const typeLabel = copy.duration.typeOptions[type ?? "none"];
  const repeatLabel = copy.duration.repeatOptions[repeat ?? "never"];

  return (
    <span>
      {typeLabel}
      {repeat && repeat !== "never" ? ` · ${repeatLabel}` : ""}
    </span>
  );
});
