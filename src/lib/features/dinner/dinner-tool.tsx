"use client";

import styles from "@/app/tool-shell.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToolI18n } from "@/i18n/tool-i18n";
import { DinnerResult } from "@/lib/features/dinner/dinner-result";
import { DinnerRoulette } from "@/lib/features/dinner/dinner-roulette";
import { DinnerSelections } from "@/lib/features/dinner/dinner-selections";
import {
  type CuisineFormValues,
  cuisineSchema,
} from "@/schemas/dinner-decider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function DinnerTool() {
  const { copy } = useToolI18n();
  const content = copy.dinner;
  const [options, setOptions] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CuisineFormValues>({
    resolver: zodResolver(cuisineSchema),
  });

  const onSubmit = useCallback(
    (data: CuisineFormValues) => {
      const nextOption = data.cuisine.trim();
      const isDuplicate = options.some(
        (option) =>
          option.toLocaleLowerCase() === nextOption.toLocaleLowerCase(),
      );

      if (isDuplicate) {
        toast.error(content.duplicate);
        return;
      }

      setOptions((current) => [...current, nextOption]);
      setResult(null);
      reset();
    },
    [content.duplicate, options, reset],
  );

  const startRoulette = useCallback(() => {
    if (options.length <= 1 || isSpinning) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * options.length);
    setResult(options[randomIndex]);
    setIsSpinning(true);
  }, [isSpinning, options]);

  const removeOption = useCallback(
    (index: number) => {
      if (isSpinning) {
        return;
      }

      setOptions((current) =>
        current.filter((_, itemIndex) => itemIndex !== index),
      );
      setResult(null);
    },
    [isSpinning],
  );

  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
  }, []);

  return (
    <div className={`${styles.workspaceBody} ${styles.splitGrid}`}>
      <section className={`${styles.panel} ${styles.stack}`}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="dinner-option">
            {content.optionLabel}
          </label>
          <div className={styles.toolbarGroup}>
            <Input
              id="dinner-option"
              placeholder={content.optionPlaceholder}
              className={`${styles.input} ${styles.grow}`}
              disabled={isSpinning}
              maxLength={48}
              {...register("cuisine")}
            />
            <Button
              type="submit"
              className={styles.primaryButton}
              disabled={isSpinning}
            >
              <Plus aria-hidden="true" />
              {content.add}
            </Button>
          </div>
          {errors.cuisine ? (
            <p className={styles.errorText}>{content.required}</p>
          ) : null}
        </form>

        <div className={styles.panelHeader}>
          <div>
            <span className={styles.panelLabel}>{content.options}</span>
            <p className={styles.panelTitle}>{options.length}</p>
          </div>
        </div>

        {options.length ? (
          <DinnerSelections
            options={options}
            removeOption={removeOption}
            removeLabel={content.removeOption}
            disabled={isSpinning}
          />
        ) : (
          <div className={styles.emptyState}>
            <div>
              <span className={styles.emptyKicker}>00</span>
              <h2>{content.emptyTitle}</h2>
              <p>{content.emptyDescription}</p>
            </div>
          </div>
        )}

        <Button
          type="button"
          onClick={startRoulette}
          className={styles.primaryButton}
          disabled={isSpinning || options.length <= 1}
        >
          {isSpinning ? content.spinning : content.decide}
        </Button>
      </section>

      <section className={styles.stack}>
        {options.length > 1 ? (
          <DinnerRoulette
            isSpinning={isSpinning}
            options={options}
            result={result ?? ""}
            onSpinComplete={handleSpinComplete}
            ariaLabel={content.wheelLabel}
          />
        ) : (
          <div className={styles.emptyState}>
            <div>
              <span className={styles.emptyKicker}>02</span>
              <h2>{content.emptyTitle}</h2>
              <p>{content.emptyDescription}</p>
            </div>
          </div>
        )}

        {result && !isSpinning ? (
          <DinnerResult
            result={result}
            label={content.resultLabel}
            prefix={content.resultPrefix}
          />
        ) : null}
      </section>
    </div>
  );
}
