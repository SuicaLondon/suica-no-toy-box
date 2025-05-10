import { RepeatOptionType, TypeOptionType } from "@/schemas/duration";
import { memo } from "react";

type TypeLabelProps = {
  type?: TypeOptionType;
  repeat?: RepeatOptionType;
};

export const TypeLabel = memo(function TypeLabel({
  type,
  repeat,
}: TypeLabelProps) {
  function getLabel() {
    switch (type) {
      case "anniversary":
        return "Anniversary";
      case "birthday":
        return "Birthday";
      case "bills":
        return "Bills" + (repeat ? ` every ${repeat}` : "");
      default:
        return repeat ? `Repeats every ${repeat}` : "";
    }
  }
  return <span>{getLabel()}</span>;
});
