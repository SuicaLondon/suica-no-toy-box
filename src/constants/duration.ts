export const repeatOptions = [
  {
    label: "No Repeat",
    value: "never",
  },
  {
    label: "Every Week",
    value: "week",
  },
  {
    label: "Every Month",
    value: "month",
  },
  {
    label: "Every Year",
    value: "year",
  },
] as const;

export const typeOptions = [
  {
    label: "No Type",
    value: "none",
  },
  {
    label: "Anniversary",
    value: "anniversary",
  },
  {
    label: "Birthday",
    value: "birthday",
  },
  {
    label: "Bills",
    value: "bills",
  },
] as const;

export const DURATION_WIDGET_LOCAL_STORAGE_KEY = "duration-widgets";
