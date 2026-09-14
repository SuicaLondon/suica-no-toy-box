import { Badge } from "suica-ui/badge";
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
  const tagClassName =
    "border-toy-accent/20 bg-toy-accent/10 text-toy-accent rounded-full px-3 py-1 font-sans text-sm leading-relaxed font-medium whitespace-nowrap";

  return (
    <>
      <Badge variant="outline" className={tagClassName}>
        {typeLabel}
      </Badge>
      {repeat && repeat !== "never" && (
        <Badge variant="outline" className={tagClassName}>
          {repeatLabel}
        </Badge>
      )}
    </>
  );
});
