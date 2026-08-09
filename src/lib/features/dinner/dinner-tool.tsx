"use client";

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
    <div className="mt-5 grid grid-cols-2 gap-3.5 max-[1100px]:grid-cols-1 max-[767px]:mt-[18px]">
      <section className="border-toy-line text-toy-text grid gap-3.5 rounded-[2px] border bg-[color-mix(in_srgb,var(--toy-bg)_96%,transparent)] p-6 max-[767px]:p-[18px]">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-[9px]">
          <label
            className="text-toy-muted font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase"
            htmlFor="dinner-option"
          >
            {content.optionLabel}
          </label>
          <div className="flex flex-wrap items-center gap-2.5 max-[767px]:w-full max-[767px]:[&>*]:grow">
            <Input
              id="dinner-option"
              placeholder={content.optionPlaceholder}
              className="border-toy-line-strong text-toy-text placeholder:text-toy-muted/75 focus-visible:border-toy-accent focus-visible:ring-toy-accent min-h-12 min-w-0 flex-[1_1_14rem] rounded-[2px] bg-transparent px-3.5 shadow-none focus-visible:ring-1 focus-visible:ring-offset-2"
              disabled={isSpinning}
              maxLength={48}
              {...register("cuisine")}
            />
            <Button
              type="submit"
              className="border-toy-accent bg-toy-accent text-toy-bg hover:text-toy-bg min-h-11 rounded-[2px] border font-mono text-xs tracking-[0.08em] uppercase shadow-none hover:bg-[color-mix(in_srgb,var(--toy-accent)_88%,var(--toy-text))] max-[520px]:w-full"
              disabled={isSpinning}
            >
              <Plus aria-hidden="true" />
              {content.add}
            </Button>
          </div>
          {errors.cuisine ? (
            <p className="text-toy-error m-0 text-[0.8125rem] leading-[1.45]">
              {content.required}
            </p>
          ) : null}
        </form>

        <div className="border-toy-line mb-[22px] flex items-start justify-between gap-5 border-b pb-[18px] max-[520px]:flex-col max-[520px]:items-stretch">
          <div>
            <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
              {content.options}
            </span>
            <p className="mt-1.5 text-xl leading-tight font-semibold">
              {options.length}
            </p>
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
          <div className="border-toy-line-strong [&_p]:text-toy-muted flex min-h-60 items-center justify-center border border-dashed px-7 py-12 text-center [&_h2]:mt-2.5 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:max-w-[430px] [&_p]:text-sm [&_p]:leading-[1.6]">
            <div>
              <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
                00
              </span>
              <h2>{content.emptyTitle}</h2>
              <p>{content.emptyDescription}</p>
            </div>
          </div>
        )}

        <Button
          type="button"
          onClick={startRoulette}
          className="border-toy-accent bg-toy-accent text-toy-bg hover:text-toy-bg min-h-11 rounded-[2px] border font-mono text-xs tracking-[0.08em] uppercase shadow-none hover:bg-[color-mix(in_srgb,var(--toy-accent)_88%,var(--toy-text))] max-[520px]:w-full"
          disabled={isSpinning || options.length <= 1}
        >
          {isSpinning ? content.spinning : content.decide}
        </Button>
      </section>

      <section className="grid gap-3.5">
        {options.length > 1 ? (
          <DinnerRoulette
            isSpinning={isSpinning}
            options={options}
            result={result ?? ""}
            onSpinComplete={handleSpinComplete}
            ariaLabel={content.wheelLabel}
          />
        ) : (
          <div className="border-toy-line-strong [&_p]:text-toy-muted flex min-h-60 items-center justify-center border border-dashed px-7 py-12 text-center [&_h2]:mt-2.5 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:max-w-[430px] [&_p]:text-sm [&_p]:leading-[1.6]">
            <div>
              <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
                02
              </span>
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
