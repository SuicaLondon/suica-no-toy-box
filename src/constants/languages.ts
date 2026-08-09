export const languages = [
  { code: "en", name: { en: "English", zh: "英文" } },
  { code: "es", name: { en: "Spanish", zh: "西班牙文" } },
  { code: "fr", name: { en: "French", zh: "法文" } },
  { code: "de", name: { en: "German", zh: "德文" } },
  { code: "it", name: { en: "Italian", zh: "義大利文" } },
  { code: "pt", name: { en: "Portuguese", zh: "葡萄牙文" } },
  { code: "nl", name: { en: "Dutch", zh: "荷蘭文" } },
  { code: "ja", name: { en: "Japanese", zh: "日文" } },
  { code: "ko", name: { en: "Korean", zh: "韓文" } },
  { code: "zh", name: { en: "Chinese", zh: "中文" } },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];
