import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to know the theme's own tokens (src/app/globals.css and
 * suica-ui), or it mistakes text-body for a colour and drops it.
 */
const mergeClasses = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "headline",
        "title-md",
        "title-sm",
        "body",
        "body-sm",
        "label",
        "data",
        "badge-sm",
        "eyebrow",
      ],
      "font-weight": ["heading"],
      tracking: ["button", "tab", "tag", "eyebrow", "wordmark", "chrome"],
      radius: ["control", "panel"],
      container: ["measure"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return mergeClasses(clsx(inputs));
}
