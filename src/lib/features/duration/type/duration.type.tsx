import { RepeatOptionType, TypeOptionType } from "@/schemas/duration";

export type DurationWidget = {
  id: string;
  name: string;
  date: Date;
  repeat?: RepeatOptionType;
  type?: TypeOptionType;
};
