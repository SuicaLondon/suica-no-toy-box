import { Languages, Book, ForkKnife, Calendar } from "lucide-react";

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
  {
    title: "Duration Board",
    description:
      "A board for tracking important dates to make your life have hope.",
    icon: Calendar,
    href: "/duration",
  },
] as const;
