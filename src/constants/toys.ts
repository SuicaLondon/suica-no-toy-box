import {
  BriefcaseBusiness,
  CalendarDays,
  Languages,
  ImageDown,
  Utensils,
} from "lucide-react";

export const apps = [
  {
    title: {
      en: "Suica Translate",
      zh: "Suica 翻譯",
    },
    description: {
      en: "Focused translation without the clutter.",
      zh: "專注、俐落的翻譯工具。",
    },
    icon: Languages,
    href: "/translate",
  },
  {
    title: {
      en: "Sponsor Me",
      zh: "Sponsor Me",
    },
    description: {
      en: "Find UK companies that can sponsor a role.",
      zh: "搜尋可提供英國工作簽證擔保的公司。",
    },
    icon: BriefcaseBusiness,
    href: "/sponsorship",
  },
  {
    title: {
      en: "What for dinner?",
      zh: "今晚吃什麼？",
    },
    description: {
      en: "Let chance choose tonight's menu.",
      zh: "讓隨機選擇替你決定今晚吃什麼。",
    },
    icon: Utensils,
    href: "/dinner",
  },
  {
    title: {
      en: "Duration Board",
      zh: "日期看板",
    },
    description: {
      en: "Keep the dates worth looking forward to.",
      zh: "記下那些值得期待的重要日子。",
    },
    icon: CalendarDays,
    href: "/duration",
  },
  {
    title: { en: "Image Studio", zh: "圖片工作室" },
    description: {
      en: "Compress images locally or on our server.",
      zh: "在本機或伺服器上壓縮圖片。",
    },
    icon: ImageDown,
    href: "/image-compress",
  },
] as const;
