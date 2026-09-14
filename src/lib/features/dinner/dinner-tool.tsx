"use client";

import { Card } from "suica-ui/card";

import { Field } from "suica-ui/field";
import { SectionHeading } from "suica-ui/section-heading";

import { Button } from "suica-ui/button";
import { Input } from "suica-ui/input";
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
      <Card className="grid gap-3.5 p-6 max-[767px]:p-[18px]">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-[9px]">
          <div className="flex flex-wrap items-end gap-2.5 max-[767px]:w-full max-[767px]:[&>*]:grow">
            <Field
              label={content.optionLabel}
              error={errors.cuisine ? content.required : undefined}
              className="min-w-0 flex-[1_1_14rem]"
            >
              <Input
                id="dinner-option"
                placeholder={content.optionPlaceholder}
                className="min-h-12 w-full min-w-0 px-3.5"
                disabled={isSpinning}
                maxLength={48}
                {...register("cuisine")}
              />
            </Field>
            <Button
              type="submit"
              className="min-h-11 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
              disabled={isSpinning}
            >
              <Plus aria-hidden="true" />
              {content.add}
            </Button>
          </div>
        </form>

        <SectionHeading
          titleId="dinner-options-title"
          eyebrow={content.options}
          title={options.length}
          description={null}
          className="border-line border-b px-0 pb-4"
        />

        {options.length ? (
          <DinnerSelections
            options={options}
            removeOption={removeOption}
            removeLabel={content.removeOption}
            disabled={isSpinning}
          />
        ) : (
          <Card className="[&_p]:text-toy-muted flex min-h-60 items-center justify-center border-dashed px-7 py-12 text-center [&_h2]:mt-2.5 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:max-w-[430px] [&_p]:text-sm [&_p]:leading-[1.6]">
            <div>
              <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
                00
              </span>
              <h2>{content.emptyTitle}</h2>
              <p>{content.emptyDescription}</p>
            </div>
          </Card>
        )}

        <Button
          type="button"
          onClick={startRoulette}
          className="min-h-11 font-mono text-xs tracking-[0.08em] uppercase max-[520px]:w-full"
          disabled={isSpinning || options.length <= 1}
        >
          {isSpinning ? content.spinning : content.decide}
        </Button>
      </Card>

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
          <Card className="[&_p]:text-toy-muted flex min-h-60 items-center justify-center border-dashed px-7 py-12 text-center [&_h2]:mt-2.5 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mx-auto [&_p]:mt-2.5 [&_p]:max-w-[430px] [&_p]:text-sm [&_p]:leading-[1.6]">
            <div>
              <span className="text-toy-accent font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
                02
              </span>
              <h2>{content.emptyTitle}</h2>
              <p>{content.emptyDescription}</p>
            </div>
          </Card>
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
