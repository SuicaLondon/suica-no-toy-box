/**
 * The words on the Grill Restaurant page. "Google Maps" is always written
 * exactly so: the page wraps it in translate="no" and never recases or
 * localises it. The people using the page see sources and a verdict, never
 * "agents" or models.
 */
const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const grillRestaurantMessages = {
  en: {
    index: "06",
    title: "Grill Restaurant",
    description: "Find out if a restaurant is worth the trip, or just hype.",
    metaDescription:
      "Paste a Google Maps link and get a straight verdict on whether a restaurant is worth it, from its Google Maps reviews, other review sites and the MICHELIN Guide.",

    linkLabel: "Google Maps link",
    linkPlaceholder: "https://maps.app.goo.gl/…",
    linkHelp:
      "In the Google Maps app, tap Share, then Copy link. A check takes a minute or two.",
    resultsLanguage: "",
    paste: "Paste",
    pasteFailed: "Could not read the clipboard. Paste the link by hand.",
    submit: "Grill it",
    opening: "Opening the link",
    linkErrors: {
      required: "Paste a Google Maps link first.",
      invalid: "That is not a link.",
      unsupported: "That is not a Google Maps link.",
      "no-name":
        "That link has no place name in it. Open the place in Google Maps, then use Share and Copy link.",
      unreachable:
        "That share link did not open a place. Copy it again and retry.",
    },
    accessCodeLabel: "Access code",
    accessCodeHelp: "This copy of the toy box needs a code to start a check.",
    accessCodeWrong: "That code was not accepted.",
    notConfigured: "Grill Restaurant is not set up on this server yet.",
    offline: "Could not reach the server. Check your connection and retry.",
    opensNewTab: "opens in a new tab",

    // The place and the check's progress
    openInMaps: "Open in Google Maps",
    grilling: "Grilling",
    secondsLeft: (seconds: number) => `about ${seconds} s left`,
    almostDone: "almost done",
    runningLong: "taking longer than usual",
    doneIn: (seconds: number) => `Done in ${seconds} s`,
    stoppedAt: (clock: string) => `Stopped at ${clock}`,
    lostAt: (clock: string) => `Connection lost at ${clock}`,
    lostBody: "What had finished is still here.",
    stop: "Stop",
    again: "Grill another",
    runAgain: "Run again",
    idleTitle: "Paste a link to start",
    idleBody:
      "You get a straight answer on whether it is worth going, with the reviews and sources behind it one tap away.",

    // The verdict
    verdictTitle: "The verdict",
    verdictPending:
      "Checking the sources and writing the verdict takes a minute or two.",
    verdictWriting: "Writing the verdict",
    verdictFailedTitle: "No verdict this time",
    verdictFailedBody:
      "The sources are still worth a look. Try again in a minute.",
    verdictStoppedTitle: "Stopped before the verdict",
    decisions: { go: "Go", maybe: "Maybe", skip: "Skip" },
    theGood: "The good",
    theBad: "The bad",
    dividedTitle: "Reviews disagree",
    worthOrdering: "Worth ordering",
    notWorthOrdering: "Not worth ordering",
    goIf: "Go if",
    skipIf: "Skip if",
    headsUp: "Heads up",
    confidence: {
      low: "Thin evidence. Few sources, or small ones.",
      medium: "Fair evidence. Several sources, some of them small.",
      high: "Solid evidence. Several independent sources agree.",
    },
    verdictScope:
      "Written from the review sites and the MICHELIN Guide. It never sees the Google Maps reviews, which are listed with the sources.",

    // The sources
    sources: {
      google: "Google Maps reviews",
      otherSources: "Review sites",
      michelin: "MICHELIN Guide",
    },
    checksLive: "What we're checking",
    checksTitle: "What we checked",
    waiting: "Waiting",
    readingReviews: "Reading the reviews",
    searchingWeb: "Searching the web",
    searchingGuide: "Searching the Guide",
    readingSite: (host: string) => `Reading ${host}`,
    couldNotCheck: "Could not check",
    stopped: "Stopped",
    ratingLine: (rating: string, count: string) =>
      `${rating} from ${count} reviews`,
    reviewsRead: (count: number) =>
      plural(count, "review read", "reviews read"),
    sitesFound: (count: number) =>
      count === 0 ? "None found" : plural(count, "source", "sources"),
    michelinNew: (distinction: string, year: number) =>
      `${distinction}, new in ${year}`,
    michelinSince: (distinction: string, year: number) =>
      `${distinction} since ${year}`,
    notListed: "Not listed",
    showDetails: "Show details",
    hideDetails: "Hide details",

    // Source details
    googleAnswer:
      "Written by Google's AI from Google Maps reviews, shown unchanged.",
    googleTranslated:
      "Written by Google's AI from Google Maps reviews, then translated by it.",
    showOriginal: "Show original",
    showTranslation: "Show translation",
    pros: "Pros",
    cons: "Cons",
    googleReviews: "The reviews behind it",
    showAllReviews: (count: number) => `Show all ${count}`,
    openReview: "Open this review",
    googleNoReviews: "Google Maps returned no review excerpts for this place.",
    googlePrivacy: "Shown only to you. Nothing is stored.",
    noRating: "no rating",
    reviewCount: (count: number) => plural(count, "review", "reviews"),
    michelinHistory: "Year by year",
    michelinInspector: "What the inspectors say",
    michelinGuide: "Open its Guide page",
    source: "Source",
    detailFailed:
      "This source could not be checked. The others were not affected.",
    detailStopped: "The check was stopped before this source finished.",
    translating: "Translating…",
    untranslated: "Could not translate this, so it is in English.",

    // Cost
    costLine: (cost: string) => `This check cost about ${cost} in API fees.`,
    costUnknown: "an unknown amount",

    // Announcements for screen readers
    finished: (name: string) => `${name} checked.`,
    failed: (name: string) => `${name} could not be checked.`,
    verdictReady: "The verdict is ready.",
  },
  zh: {
    index: "06",
    title: "Grill Restaurant",
    description: "看一家餐廳是實至名歸，還是名過其實。",
    metaDescription:
      "貼上 Google Maps 連結，從 Google Maps 評論、其他評論網站與米其林指南，直接告訴你這家餐廳值不值得去。",

    linkLabel: "Google Maps 連結",
    linkPlaceholder: "https://maps.app.goo.gl/…",
    linkHelp:
      "在 Google Maps App 中點「分享」，再點「複製連結」。一次檢查約需一到兩分鐘。",
    resultsLanguage: "所有來源都會翻成中文，隨時可以切換看英文原文。",
    paste: "貼上",
    pasteFailed: "無法讀取剪貼簿，請手動貼上連結。",
    submit: "開烤",
    opening: "正在開啟連結",
    linkErrors: {
      required: "請先貼上 Google Maps 連結。",
      invalid: "這不是連結。",
      unsupported: "這不是 Google Maps 連結。",
      "no-name":
        "這個連結裡沒有地點名稱。請在 Google Maps 開啟該地點，再點「分享」與「複製連結」。",
      unreachable: "這個分享連結沒有指向任何地點，請重新複製後再試一次。",
    },
    accessCodeLabel: "通行碼",
    accessCodeHelp: "這個站點需要通行碼才能開始檢查。",
    accessCodeWrong: "通行碼不正確。",
    notConfigured: "這台伺服器尚未設定 Grill Restaurant。",
    offline: "無法連上伺服器，請檢查網路後再試一次。",
    opensNewTab: "在新分頁開啟",

    openInMaps: "在 Google Maps 開啟",
    grilling: "開烤中",
    secondsLeft: (seconds: number) => `約剩 ${seconds} 秒`,
    almostDone: "即將完成",
    runningLong: "比平常久",
    doneIn: (seconds: number) => `${seconds} 秒烤完`,
    stoppedAt: (clock: string) => `已於 ${clock} 停止`,
    lostAt: (clock: string) => `連線於 ${clock} 中斷`,
    lostBody: "已完成的部分仍保留在這裡。",
    stop: "停止",
    again: "再烤一家",
    runAgain: "重新檢查",
    idleTitle: "貼上連結即可開始",
    idleBody:
      "你會得到一句值不值得去的直白答案，背後的評論與來源點一下就能看。",

    verdictTitle: "結論",
    verdictPending: "查詢中，大約需要一到兩分鐘。",
    verdictWriting: "正在寫結論",
    verdictFailedTitle: "這次沒能寫出結論",
    verdictFailedBody: "各來源的結果仍可參考，過一分鐘再試一次。",
    verdictStoppedTitle: "結論寫出前已停止",
    decisions: { go: "去吃", maybe: "看情況", skip: "別去" },
    theGood: "好在哪",
    theBad: "雷在哪",
    dividedTitle: "評價分歧",
    worthOrdering: "值得點",
    notWorthOrdering: "不值得點",
    goIf: "適合",
    skipIf: "不適合",
    headsUp: "注意",
    confidence: {
      low: "證據偏少，來源不多或規模不大。",
      medium: "證據普通，有幾個來源，部分規模不大。",
      high: "證據充足，多個獨立來源看法一致。",
    },
    verdictScope:
      "根據評論網站與米其林指南寫成，沒有參考 Google Maps 評論。Google Maps 評論可以在來源清單裡看。",

    sources: {
      google: "Google Maps 評論",
      otherSources: "評論網站",
      michelin: "米其林指南",
    },
    checksLive: "正在查這些來源",
    checksTitle: "查了哪些來源",
    waiting: "等待中",
    readingReviews: "正在讀評論",
    searchingWeb: "正在搜尋網路",
    searchingGuide: "正在查指南",
    readingSite: (host: string) => `正在讀 ${host}`,
    couldNotCheck: "沒查成",
    stopped: "已停止",
    ratingLine: (rating: string, count: string) =>
      `${rating} 分，${count} 則評論`,
    reviewsRead: (count: number) => `讀了 ${count} 則評論`,
    sitesFound: (count: number) =>
      count === 0 ? "沒有找到" : `${count} 個來源`,
    michelinNew: (distinction: string, year: number) =>
      `${distinction}，${year} 年新入選`,
    michelinSince: (distinction: string, year: number) =>
      `${distinction}，${year} 年起`,
    notListed: "未入選",
    showDetails: "看細節",
    hideDetails: "收起細節",

    googleAnswer: "這段由 Google 的 AI 根據 Google Maps 評論寫成，原文照登。",
    googleTranslated:
      "這段由 Google 的 AI 根據 Google Maps 評論寫成，再由它翻成中文。",
    showOriginal: "顯示原文",
    showTranslation: "顯示翻譯",
    pros: "優點",
    cons: "缺點",
    googleReviews: "依據的評論",
    showAllReviews: (count: number) => `顯示全部 ${count} 則`,
    openReview: "開啟這則評論",
    googleNoReviews: "Google Maps 沒有回傳這個地點的評論摘錄。",
    googlePrivacy: "只顯示給你看，不會儲存。",
    noRating: "沒有評分",
    reviewCount: (count: number) => `${count} 則評論`,
    michelinHistory: "逐年紀錄",
    michelinInspector: "評審怎麼說",
    michelinGuide: "開啟指南頁面",
    source: "來源",
    detailFailed: "這個來源沒查成，不影響其他來源。",
    detailStopped: "這個來源還沒查完，檢查就停了。",
    translating: "翻譯中…",
    untranslated: "沒能翻成中文，以下是英文原文。",

    costLine: (cost: string) => `這次檢查約花了 ${cost} 的 API 費用。`,
    costUnknown: "未知金額",

    finished: (name: string) => `${name}已查完。`,
    failed: (name: string) => `${name}沒查成。`,
    verdictReady: "結論已寫好。",
  },
};

export type GrillRestaurantMessages = (typeof grillRestaurantMessages)["en"];
