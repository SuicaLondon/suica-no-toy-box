"use client";

import styles from "@/app/tool-shell.module.css";
import CopyButton from "@/components/button/copy-button";
import LanguageSelect from "@/components/select/language-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type LanguageCode, languages } from "@/constants/languages";
import { useTranslate } from "@/hooks/use-translate";
import { useToolI18n } from "@/i18n/tool-i18n";
import {
  translateFormSchema,
  type TranslateFormValues,
} from "@/schemas/translate";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

function getSavedLanguage(
  key: string,
  defaultValue: LanguageCode,
): LanguageCode {
  try {
    const saved = window.localStorage.getItem(key);
    return saved && languages.some((language) => language.code === saved)
      ? (saved as LanguageCode)
      : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveLanguage(key: string, language: LanguageCode) {
  try {
    window.localStorage.setItem(key, language);
  } catch {
    // Translation still works when storage is unavailable.
  }
}

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
    form.setValue("sourceLang", getSavedLanguage("sourceLang", "en"));
    form.setValue("targetLang", getSavedLanguage("targetLang", "es"));
  }, [form]);

  function handleSwapLanguages() {
    const currentValues = form.getValues();
    form.setValue("sourceLang", currentValues.targetLang);
    form.setValue("targetLang", currentValues.sourceLang);
    form.setValue("sourceText", currentValues.targetText);
    form.setValue("targetText", currentValues.sourceText);
    saveLanguage("sourceLang", currentValues.targetLang);
    saveLanguage("targetLang", currentValues.sourceLang);
  }

  function onSubmit(data: TranslateFormValues) {
    form.setValue("targetText", "");
    saveLanguage("sourceLang", data.sourceLang);
    saveLanguage("targetLang", data.targetLang);

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
      className={`${styles.workspaceBody} ${styles.stack}`}
    >
      <div className={styles.toolbar}>
        <div />
        <Button
          type="button"
          variant="outline"
          className={styles.secondaryButton}
          onClick={handleSwapLanguages}
          disabled={isPending}
        >
          <ArrowLeftRight aria-hidden="true" />
          {content.swap}
        </Button>
      </div>

      <div className={styles.splitGrid}>
        <section className={styles.panel}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {content.sourceLanguage}
            </label>
            <LanguageSelect
              name="sourceLang"
              control={form.control}
              locale={locale}
              placeholder={content.selectLanguage}
              ariaLabel={content.sourceLanguage}
              disabled={isPending}
              triggerClassName={styles.selectTrigger}
            />
          </div>

          <div className={`${styles.relative} mt-4`}>
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
                    className={styles.textarea}
                  />
                  {error ? (
                    <p className={styles.errorText}>{content.required}</p>
                  ) : null}
                </>
              )}
            />
            <CopyButton
              text={sourceText}
              className={`${styles.iconButton} ${styles.copyButton}`}
              ariaLabel={content.copySource}
              successMessage={content.copied}
              errorMessage={content.copyFailed}
            />
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {content.targetLanguage}
            </label>
            <LanguageSelect
              name="targetLang"
              control={form.control}
              locale={locale}
              placeholder={content.selectLanguage}
              ariaLabel={content.targetLanguage}
              disabled={isPending}
              triggerClassName={styles.selectTrigger}
            />
          </div>

          <div className={`${styles.relative} mt-4`}>
            <Controller
              name="targetText"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder={content.targetPlaceholder}
                  aria-label={content.targetPlaceholder}
                  className={styles.textarea}
                  readOnly
                />
              )}
            />
            <CopyButton
              text={targetText}
              className={`${styles.iconButton} ${styles.copyButton}`}
              ariaLabel={content.copyTranslation}
              successMessage={content.copied}
              errorMessage={content.copyFailed}
            />
          </div>
        </section>
      </div>

      <div className={styles.toolbar}>
        <div />
        <Button
          type="submit"
          className={styles.primaryButton}
          disabled={isPending}
        >
          {isPending ? content.submitting : content.submit}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
