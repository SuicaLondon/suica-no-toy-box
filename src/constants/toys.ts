import { Languages, Book } from "lucide-react";

export const apps = [
  {
    title: "Suica Translate",
    description: "A Google Translate-like interface for quick translations",
    icon: Languages,
    href: "/translate",
  },
  {
    title: "Sponsor Me",
    description:
      "Search for sponsorships for the company you want to apply to in the UK",
    icon: Book,
    href: "/sponsorship",
  },
] as const;
