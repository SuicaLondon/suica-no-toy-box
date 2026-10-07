import type { Locale } from "./locales";

export const imageCompressCopy = {
  en: {
    index: "05",
    title: "Image Studio",
    description: "Compress and convert images on your device or our server.",
    metaDescription:
      "Compress JPEG, PNG, WebP and HEIC images locally or with remote server processing. Choose a size limit or manual settings, compare the result and download.",
    processingLocation: "Processing location",
    onDevice: "On device",
    remoteServer: "Remote server",
    processingNote:
      "On device: no uploads. Remote: uploads each update, up to 4 MB and 20 MP.",
    outputSettings: "02 / Output settings",
    outputFormat: "Output format",
    chooseFormat: "Choose a format",
    mode: "Mode",
    sizePriority: "Size priority",
    manual: "Manual",
    maximumSize: "Maximum file size (MB)",
    targetHint:
      "Adjusts quality, then dimensions if needed. 1 MB = 1,000,000 bytes.",
    targetError: "Enter at least 0.001 MB.",
    losslessQuality: "Quality · lossless PNG",
    quality: "Quality",
    manualHint:
      "Keeps original dimensions. PNG is lossless; other formats use the selected quality.",
    jpegHint: "JPEG fills transparent areas with white.",
    privacyNotes: "Privacy & processing notes",
    privacyDetail:
      "Local mode keeps images on your device. Remote mode uploads the original, including camera metadata, for each update and processes it in memory without file storage or history.",
    remoteLimits:
      "Remote uploads and downloads are limited to 4 MB, with a 20 MP input limit. Use local mode for larger images.",
    metadataNote:
      "Outputs omit camera metadata. Local and remote encoders may produce different results. HEIC defaults to JPEG output.",
    sourceImage: "01 / Source image",
    replaceImage: "Drop or choose another image",
    dropImage: "Drop an image or click to browse",
    remoteSize: "Up to 4 MB remotely",
    localSize: "Up to 50 MB",
    chooseImage: "Choose an image",
    oneImage: "Please choose one image at a time.",
    supportedImage: "Choose a JPEG, PNG, WebP or HEIC image.",
    fileSizeError: "Choose a non-empty image no larger than 50 MB.",
    livePreview: "03 / Live preview",
    previewHint: "Updates automatically after you stop adjusting.",
    fullSize: "Open full-size result",
    stopped: "Processing stopped. See details below.",
    getStarted: "Choose an image to get started.",
    reading: "Reading image locally…",
    checkSettings: "Check your settings to continue.",
    waiting: "Waiting for your latest settings…",
    uploading: "Uploading",
    converting: "Converting on server…",
    downloading: "Downloading",
    estimating: "Processing locally · estimating time…",
    targetMissed: "Target not reached. See details below.",
    ready: "Ready",
    server: "server",
    local: "local",
    seconds: "seconds",
    nextPass: "Estimated next pass:",
    cancel: "Cancel",
    retry: "Retry",
    comparisonPreview: "Image comparison preview",
    originalImage: "Original image",
    convertedImage: "Converted image",
    preparing: "Preparing output",
    compare: "Compare original and converted image",
    emptyPreview: "Your image, a little lighter.",
    targetMissedDetail:
      "Target not reached. Download the smallest result found, or increase the size limit.",
    useLocal: "Use on-device mode",
    uploadProgress: "Upload progress",
    downloadProgress: "Download progress",
    original: "Original",
    processingOutput: "Processing output",
    result: "Result",
    fileSize: "File size",
    smaller: "smaller",
    larger: "larger",
    awaiting: "Awaiting result",
    dimensions: "Dimensions",
    output: "Output",
    lossless: "Lossless",
    download: "Download",
    image: "image",
  },
  zh: {
    index: "05",
    title: "圖片工作室",
    description: "在本機或伺服器上壓縮與轉換圖片。",
    metaDescription:
      "在本機或遠端伺服器壓縮 JPEG、PNG、WebP 與 HEIC 圖片。可設定檔案大小上限或手動調整品質，比較結果並下載。",
    processingLocation: "處理位置",
    onDevice: "本機處理",
    remoteServer: "遠端伺服器",
    processingNote:
      "本機：不會上傳圖片。遠端：每次更新皆會上傳，限 4 MB 與 2,000 萬像素。",
    outputSettings: "02 / 輸出設定",
    outputFormat: "輸出格式",
    chooseFormat: "選擇格式",
    mode: "模式",
    sizePriority: "大小優先",
    manual: "手動設定",
    maximumSize: "檔案大小上限（MB）",
    targetHint: "先調整品質，必要時再縮小尺寸。1 MB = 1,000,000 位元組。",
    targetError: "請輸入至少 0.001 MB。",
    losslessQuality: "品質 · 無損 PNG",
    quality: "品質",
    manualHint: "保留原始尺寸。PNG 使用無損壓縮；其他格式使用所選品質。",
    jpegHint: "JPEG 會以白色填滿透明區域。",
    privacyNotes: "隱私與處理說明",
    privacyDetail:
      "本機模式讓圖片留在你的裝置上。遠端模式會在每次更新時上傳原圖（含相機中繼資料），僅於記憶體中處理，不儲存檔案或歷史紀錄。",
    remoteLimits:
      "遠端上傳與下載上限為 4 MB，輸入圖片上限為 2,000 萬像素。較大的圖片請使用本機模式。",
    metadataNote:
      "輸出圖片不含相機中繼資料。本機與遠端編碼器的結果可能不同。HEIC 預設輸出為 JPEG。",
    sourceImage: "01 / 原始圖片",
    replaceImage: "拖放或選擇另一張圖片",
    dropImage: "拖放圖片或點擊選擇",
    remoteSize: "遠端上限 4 MB",
    localSize: "上限 50 MB",
    chooseImage: "選擇圖片",
    oneImage: "請一次選擇一張圖片。",
    supportedImage: "請選擇 JPEG、PNG、WebP 或 HEIC 圖片。",
    fileSizeError: "請選擇非空白且不超過 50 MB 的圖片。",
    livePreview: "03 / 即時預覽",
    previewHint: "停止調整後會自動更新。",
    fullSize: "開啟完整尺寸的結果",
    stopped: "處理已停止，請查看下方說明。",
    getStarted: "選擇圖片以開始。",
    reading: "正在本機讀取圖片…",
    checkSettings: "請檢查設定以繼續。",
    waiting: "正在等待最新設定…",
    uploading: "上傳中",
    converting: "正在伺服器上轉換…",
    downloading: "下載中",
    estimating: "正在本機處理 · 估算時間中…",
    targetMissed: "未達到大小目標，請查看下方說明。",
    ready: "已就緒",
    server: "伺服器",
    local: "本機",
    seconds: "秒",
    nextPass: "預估下一輪處理：",
    cancel: "取消",
    retry: "重試",
    comparisonPreview: "圖片比較預覽",
    originalImage: "原始圖片",
    convertedImage: "轉換後的圖片",
    preparing: "正在準備輸出",
    compare: "比較原始與轉換後的圖片",
    emptyPreview: "讓你的圖片更輕巧。",
    targetMissedDetail:
      "未達到大小目標。可下載目前最小的結果，或提高大小上限。",
    useLocal: "改用本機模式",
    uploadProgress: "上傳進度",
    downloadProgress: "下載進度",
    original: "原圖",
    processingOutput: "正在處理輸出",
    result: "結果",
    fileSize: "檔案大小",
    smaller: "減少",
    larger: "增加",
    awaiting: "等待結果",
    dimensions: "圖片尺寸",
    output: "輸出",
    lossless: "無損",
    download: "下載",
    image: "圖片",
  },
} as const;

// Translate known worker and API messages at the presentation boundary.
const imageCompressionErrors: Record<string, string> = {
  "This browser cannot start local image processing. Try a current browser.":
    "此瀏覽器無法啟動本機圖片處理，請使用新版瀏覽器。",
  "Could not read this image. Try another file or reload the page.":
    "無法讀取圖片，請選擇其他檔案或重新載入頁面。",
  "Remote mode supports images up to 4 MB and 20 megapixels. Switch to local mode to process this image.":
    "遠端模式支援最大 4 MB、2,000 萬像素的圖片。請切換至本機模式處理此圖片。",
  "Local compression failed. Try a smaller image or reload to retry.":
    "本機壓縮失敗，請使用較小的圖片或重新載入後再試。",
  "Could not process this image in your browser. Try a smaller image.":
    "瀏覽器無法處理此圖片，請使用較小的圖片。",
  "Processing cancelled. Retry or adjust your settings to continue.":
    "已取消處理。請重試或調整設定以繼續。",
  "Could not reach the server. Check your connection, retry, or use local mode.":
    "無法連線至伺服器。請檢查網路連線、重試，或使用本機模式。",
  "The remote request timed out. Retry with a smaller image or use local mode.":
    "遠端請求逾時。請使用較小的圖片重試，或改用本機模式。",
  "Remote mode is limited to 4 MB uploads and downloads. Use local mode or a smaller image.":
    "遠端上傳與下載上限為 4 MB。請使用本機模式或較小的圖片。",
  "Remote conversion failed. Retry or switch to local mode.":
    "遠端轉換失敗，請重試或切換至本機模式。",
  "The server returned an invalid image. Retry or use local mode.":
    "伺服器回傳的圖片無效。請重試或使用本機模式。",
  "This image could not be read. Try a JPEG, PNG, WebP or HEIC file.":
    "無法讀取此圖片，請使用 JPEG、PNG、WebP 或 HEIC 檔案。",
  "This HEIC file contains no image.": "此 HEIC 檔案沒有圖片。",
  "Please use an image under 50 megapixels and 16,384 pixels per side.":
    "請使用低於 5,000 萬像素且每邊不超過 16,384 像素的圖片。",
  "Your browser could not create an image canvas.": "瀏覽器無法建立圖片畫布。",
  "Image processing failed. Please try another image.":
    "圖片處理失敗，請選擇另一張圖片。",
  "Enter a valid format, size, quality and image width.":
    "請輸入有效的格式、檔案大小、品質與圖片寬度。",
  "Cross-origin image uploads are not allowed.": "不允許跨來源上傳圖片。",
  "Invalid request origin.": "請求來源無效。",
  "Image settings are required.": "請提供圖片設定。",
  "Invalid image settings.": "圖片設定無效。",
  "Remote uploads are limited to 4 MB. Use local mode for larger images.":
    "遠端上傳上限為 4 MB，較大的圖片請使用本機模式。",
  "Choose a non-empty image.": "請選擇非空白的圖片。",
  "The converted file exceeds the 4 MB remote download limit. Choose a smaller size, lower quality, or local mode.":
    "轉換後的檔案超過遠端下載的 4 MB 上限。請降低大小上限或品質，或使用本機模式。",
  "The request was cancelled.": "已取消請求。",
  "Conversion took too long. Try a smaller image or use local mode.":
    "轉換時間過長，請使用較小的圖片或改用本機模式。",
  "Remote mode supports up to 20 megapixels and 16,384 pixels per side. Use local mode for larger images.":
    "遠端模式支援最高 2,000 萬像素且每邊不超過 16,384 像素的圖片。較大的圖片請使用本機模式。",
  "Choose a JPEG, PNG, WebP or HEIC image.":
    "請選擇 JPEG、PNG、WebP 或 HEIC 圖片。",
  "This image could not be decoded, or exceeds the remote image limits. Try local mode or another image.":
    "無法解碼此圖片，或圖片超過遠端處理限制。請使用本機模式或選擇另一張圖片。",
};

export function getImageCompressionError(message: string, locale: Locale) {
  if (locale === "en") return message;
  return (
    imageCompressionErrors[message] ??
    imageCompressionErrors["Image processing failed. Please try another image."]
  );
}
