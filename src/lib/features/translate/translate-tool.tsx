"use client";

import CopyButton from "@/components/button/copy-button";
import LanguageSelect from "@/components/select/language-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslate } from "@/hooks/use-translate";
import { useToolI18n } from "@/i18n/tool-i18n";
import {
  translateFormSchema,
  type TranslateFormValues,
} from "@/schemas/translate";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  getLanguagePreference,
  saveLanguagePreference,
} from "@/utils/language-preferences";

export function TranslateTool() {
  const { locale, copy } = useToolI18n();
  const content = copy.translate;
  const form = useForm<TranslateFormValues>({
    resolver: zodResolver(translateFormSchema),
    defaultValues: {
      sourceText: "",
      targetText: "",
      sourceLang: "en",
      targetLang: "es",
    },
  });
  const { mutate: translate, isPending } = useTranslate();
  const sourceText = useWatch({ control: form.control, name: "sourceText" });
  const targetText = useWatch({ control: form.control, name: "targetText" });

  useEffect(() => {
    form.setValue("sourceLang", getLanguagePreference("sourceLang", "en"));
    form.setValue("targetLang", getLanguagePreference("targetLang", "es"));
  }, [form]);

  function handleSwapLanguages() {
    const currentValues = form.getValues();
    form.setValue("sourceLang", currentValues.targetLang);
    form.setValue("targetLang", currentValues.sourceLang);
    form.setValue("sourceText", currentValues.targetText);
    form.setValue("targetText", currentValues.sourceText);
    saveLanguagePreference("sourceLang", currentValues.targetLang);
    saveLanguagePreference("targetLang", currentValues.sourceLang);
  }

  function onSubmit(data: TranslateFormValues) {
    form.setValue("targetText", "");
    saveLanguagePreference("sourceLang", data.sourceLang);
    saveLanguagePreference("targetLang", data.targetLang);

    translate(
      {
        sourceText: data.sourceText,
        sourceLang: data.sourceLang,
        targetLang: data.targetLang,
        onProgress: (text) => {
          form.setValue("targetText", form.getValues("targetText") + text);
        },
      },
      {
        onError: (error) => {
          console.error("Translation failed:", error);
          toast.error(content.error);
        },
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mt-5 grid gap-3.5 max-[767px]:mt-[18px]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 max-[767px]:flex-col max-[767px]:items-stretch">
        <div />
        <Button
          type="button"
          variant="outline"
          className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent min-h-10 rounded-[2px] bg-transparent font-mono text-xs tracking-[0.08em] uppercase shadow-none max-[520px]:w-full"
          onClick={handleSwapLanguages}
          disabled={isPending}
        >
          <ArrowLeftRight aria-hidden="true" />
          {content.swap}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[1100px]:grid-cols-1">
        <section className="border-toy-line text-toy-text rounded-[2px] border bg-[color-mix(in_srgb,var(--toy-bg)_96%,transparent)] p-6 max-[767px]:p-[18px]">
          <div className="grid gap-[9px]">
            <label className="text-toy-muted font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
              {content.sourceLanguage}
            </label>
            <LanguageSelect
              name="sourceLang"
              control={form.control}
              locale={locale}
              placeholder={content.selectLanguage}
              ariaLabel={content.sourceLanguage}
              disabled={isPending}
              triggerClassName="min-h-11 w-full justify-between rounded-[2px] border-toy-line-strong bg-transparent text-toy-text shadow-none focus-visible:border-toy-accent focus-visible:ring-1 focus-visible:ring-toy-accent focus-visible:ring-offset-2"
            />
          </div>

          <div className="relative mt-4">
            <Controller
              name="sourceText"
              control={form.control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Textarea
                    {...field}
                    disabled={isPending}
                    placeholder={content.sourcePlaceholder}
                    aria-label={content.sourcePlaceholder}
                    className="border-toy-line-strong text-toy-text placeholder:text-toy-muted/75 focus-visible:border-toy-accent focus-visible:ring-toy-accent min-h-[360px] w-full resize-y rounded-[2px] bg-transparent p-4 pr-12 text-base leading-[1.65] shadow-none focus-visible:ring-1 focus-visible:ring-offset-2 max-[767px]:min-h-60"
                  />
                  {error ? (
                    <p className="text-toy-error m-0 text-[0.8125rem] leading-[1.45]">
                      {content.required}
                    </p>
                  ) : null}
                </>
              )}
            />
            <CopyButton
              text={sourceText}
              className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent absolute top-2.5 right-2.5 size-10 min-h-10 rounded-[2px] bg-transparent p-0 font-mono text-xs tracking-[0.08em] uppercase shadow-none"
              ariaLabel={content.copySource}
              successMessage={content.copied}
              errorMessage={content.copyFailed}
            />
          </div>
        </section>

        <section
          className="border-toy-line text-toy-text rounded-[2px] border bg-[color-mix(in_srgb,var(--toy-bg)_96%,transparent)] p-6 max-[767px]:p-[18px]"
          aria-busy={isPending}
        >
          <div className="grid gap-[9px]">
            <label className="text-toy-muted font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
              {content.targetLanguage}
            </label>
            <LanguageSelect
              name="targetLang"
              control={form.control}
              locale={locale}
              placeholder={content.selectLanguage}
              ariaLabel={content.targetLanguage}
              disabled={isPending}
              triggerClassName="min-h-11 w-full justify-between rounded-[2px] border-toy-line-strong bg-transparent text-toy-text shadow-none focus-visible:border-toy-accent focus-visible:ring-1 focus-visible:ring-toy-accent focus-visible:ring-offset-2"
            />
          </div>

          <div className="relative mt-4">
            <Controller
              name="targetText"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder={content.targetPlaceholder}
                  aria-label={content.targetPlaceholder}
                  className="border-toy-line-strong text-toy-text placeholder:text-toy-muted/75 focus-visible:border-toy-accent focus-visible:ring-toy-accent min-h-[360px] w-full resize-y rounded-[2px] bg-transparent p-4 pr-12 text-base leading-[1.65] shadow-none focus-visible:ring-1 focus-visible:ring-offset-2 max-[767px]:min-h-60"
                  readOnly
                />
              )}
            />
            <CopyButton
              text={targetText}
              className="border-toy-line-strong text-toy-text hover:bg-toy-hover hover:text-toy-accent absolute top-2.5 right-2.5 size-10 min-h-10 rounded-[2px] bg-transparent p-0 font-mono text-xs tracking-[0.08em] uppercase shadow-none"
              ariaLabel={content.copyTranslation}
              successMessage={content.copied}
              errorMessage={content.copyFailed}
            />
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 max-[767px]:flex-col max-[767px]:items-stretch">
        <div />
        <Button
          type="submit"
          className="border-toy-accent bg-toy-accent text-toy-bg hover:text-toy-bg min-h-11 rounded-[2px] border font-mono text-xs tracking-[0.08em] uppercase shadow-none hover:bg-[color-mix(in_srgb,var(--toy-accent)_88%,var(--toy-text))] max-[520px]:w-full"
          disabled={isPending}
        >
          {isPending ? (
            <LoaderCircle
              className="animate-toy-spin size-[18px] shrink-0 motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <ArrowRight aria-hidden="true" />
          )}
          {isPending ? content.submitting : content.submit}
        </Button>
      </div>
    </form>
  );
}
