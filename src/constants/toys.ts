import { Languages, Book, ForkKnife } from "lucide-react";

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
  {
    title: "What for dinner?",
    description: "Decide what to eat for dinner",
    icon: ForkKnife,
    href: "/dinner",
  },
] as const;
