export const TOY_THEME = {
  attribute: "data-toy-theme",
  dark: "dark",
  light: "light",
  storageKey: "suica-toy-box-theme",
} as const;

export type ToyTheme = (typeof TOY_THEME)["dark" | "light"];
