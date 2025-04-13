interface TranslateRequest {
  sourceText: string;
  sourceLang: string;
  targetLang: string;
}

export const translateText = async (
  data: TranslateRequest,
): Promise<Response> => {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Translation failed");
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Translation failed");
  }
};
