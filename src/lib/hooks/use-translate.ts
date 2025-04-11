import { useMutation } from "@tanstack/react-query";
import { translateText } from "@/lib/clients/translate-client";
import { TranslateRequest } from "@/lib/schemas/translate";

type TranslateError = {
  error: string;
};

export function useTranslate() {
  return useMutation<
    void,
    TranslateError,
    TranslateRequest & { onProgress: (text: string) => void }
  >({
    mutationFn: async ({ sourceText, sourceLang, targetLang, onProgress }) => {
      const response = await translateText({
        sourceText,
        sourceLang,
        targetLang,
      });
      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          onProgress(text);
        }
        const finalText = decoder.decode();
        if (finalText) {
          onProgress(finalText);
        }
      } catch (error) {
        console.error("Error reading stream:", error);
        throw new Error("Failed to read translation stream");
      } finally {
        reader.releaseLock();
      }
    },
  });
}
