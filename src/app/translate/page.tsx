"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CopyButton from "@/lib/components/button/copy-button";
import LanguageSelect from "@/lib/components/select/language-select";
import { languages } from "@/lib/constants/languages";
import { useTranslate } from "@/lib/hooks/use-translate";
import {
  translateFormSchema,
  TranslateFormValues,
} from "@/lib/schemas/translate";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, Copy, Languages } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

export default function TranslatePage() {
  const form = useForm<TranslateFormValues>({
    resolver: zodResolver(translateFormSchema),
    defaultValues: {
      sourceText: "",
      targetText: "",
      sourceLang: "en",
      targetLang: "es",
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
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const onSubmit = async (data: TranslateFormValues) => {
    form.setValue("targetText", "");

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
    <div className="container mx-auto max-w-6xl p-4">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Languages className="h-6 w-6" />
            Translator
          </h1>
          <Button type="button" variant="outline" onClick={handleSwapLanguages}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Swap Languages
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <LanguageSelect name="sourceLang" control={form.control} />
            <div className="relative">
              <Controller
                name="sourceText"
                control={form.control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Textarea
                      {...field}
                      placeholder="Enter text to translate"
                      className="min-h-[200px] pr-10"
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

          <div className="space-y-2">
            <LanguageSelect name="targetLang" control={form.control} />
            <div className="relative">
              <Controller
                name="targetText"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Translation"
                    className="min-h-[200px] pr-10"
                    readOnly
                  />
                )}
              />
              <CopyButton
                text={form.getValues("targetText")}
                className="absolute top-2 right-2"
              />
            </div>
            <Button
              type="submit"
              className="w-32 self-end"
              disabled={isTranslating}
            >
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
