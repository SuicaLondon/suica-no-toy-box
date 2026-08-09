import { TOY_THEME, type ToyTheme } from "@/constants/theme";

export function isDarkTheme(theme: string | undefined) {
  return theme === TOY_THEME.dark;
}

export function getNextTheme(theme: string | undefined): ToyTheme {
  return isDarkTheme(theme) ? TOY_THEME.light : TOY_THEME.dark;
}
