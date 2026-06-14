"use client";

import CopyButton from "@/components/button/copy-button";
import LanguageSelect from "@/components/select/language-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LanguageCode, languages } from "@/constants/languages";
import { useTranslate } from "@/hooks/use-translate";
import { translateFormSchema, TranslateFormValues } from "@/schemas/translate";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, ArrowRight, Languages } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

const getSavedLanguage = (
  key: string,
  defaultValue: LanguageCode,
): LanguageCode => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    return saved && languages.some((lang) => lang.code === saved)
      ? (saved as LanguageCode)
      : defaultValue;
  } catch {
    return defaultValue;
  }
};

export default function TranslatePage() {
  const form = useForm<TranslateFormValues>({
    resolver: zodResolver(translateFormSchema),
    defaultValues: {
      sourceText: "",
      targetText: "",
      sourceLang: getSavedLanguage("sourceLang", "en"),
      targetLang: getSavedLanguage("targetLang", "es"),
    },
  });
  const { mutate: translateMutation, isPending: isTranslating } =
    useTranslate();

  const handleSwapLanguages = () => {
    const currentValues = form.getValues();
    form.setValue("sourceLang", currentValues.targetLang);
    form.setValue("targetLang", currentValues.sourceLang);
    form.setValue("sourceText", currentValues.targetText);
    form.setValue("targetText", currentValues.sourceText);
    localStorage.setItem("sourceLang", currentValues.targetLang);
    localStorage.setItem("targetLang", currentValues.sourceLang);
  };

  const onSubmit = async (data: TranslateFormValues) => {
    form.setValue("targetText", "");
    localStorage.setItem("sourceLang", data.sourceLang);
    localStorage.setItem("targetLang", data.targetLang);

    translateMutation(
      {
        sourceText: data.sourceText,
        sourceLang: data.sourceLang,
        targetLang: data.targetLang,
        onProgress: (text) => {
          const oldText = form.getValues("targetText");
          form.setValue("targetText", oldText + text);
        },
      },
      {
        onError: (error) => {
          console.error("Translation failed:", error);
          alert("Translation failed. Please try again.");
        },
      },
    );
  };

  return (
    <div className="container mx-auto flex min-h-svh max-w-6xl flex-col p-3 pb-4 sm:p-4">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-3 sm:gap-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Languages className="h-6 w-6" />
            Translator
          </h1>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full sm:w-auto"
            onClick={handleSwapLanguages}
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Swap Languages
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:flex-1 lg:grid-cols-2 lg:gap-4">
          <div className="flex min-h-0 flex-col gap-2">
            <LanguageSelect name="sourceLang" control={form.control} />
            <div className="relative flex-1">
              <Controller
                name="sourceText"
                control={form.control}
                render={({
                  field,
                  fieldState: { error },
                  formState: { isSubmitting },
                }) => (
                  <>
                    <Textarea
                      {...field}
                      disabled={isSubmitting}
                      placeholder="Enter text to translate"
                      className="min-h-[180px] resize-none pr-10 sm:min-h-[240px] lg:h-full lg:min-h-[420px]"
                    />
                    {error && (
                      <p className="mt-1 text-sm text-red-500">
                        {error.message}
                      </p>
                    )}
                  </>
                )}
              />
              <CopyButton
                text={form.getValues("sourceText")}
                className="absolute top-2 right-2"
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2">
            <LanguageSelect name="targetLang" control={form.control} />
            <div className="relative flex-1">
              <Controller
                name="targetText"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Translation"
                    className="min-h-[180px] resize-none pr-10 sm:min-h-[240px] lg:h-full lg:min-h-[420px]"
                    readOnly
                  />
                )}
              />
              <CopyButton
                text={form.getValues("targetText")}
                className="absolute top-2 right-2"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 mt-auto flex justify-end py-3 sm:static sm:py-0">
          <Button
            type="submit"
            className="h-12 min-w-36 rounded-full bg-[#0b57d0] px-5 text-white shadow-lg shadow-blue-950/15 hover:bg-[#0842a0] sm:h-10 sm:min-w-32"
            disabled={isTranslating}
          >
            <span>{isTranslating ? "Translating..." : "Translate"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
