import { useMutation } from "@tanstack/react-query";
import { TranslateRequest } from "../schemas/translate";

type TranslateResponse = {
    translation: string;
};

type TranslateError = {
    error: string;
};

export function useTranslate() {
    return useMutation<
        TranslateResponse,
        TranslateError,
        TranslateRequest
    >({
        mutationFn: async ({ sourceText, sourceLang, targetLang }) => {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sourceText,
                    sourceLang,
                    targetLang,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Translation failed");
            }

            return response.json();
        },
    });
} 