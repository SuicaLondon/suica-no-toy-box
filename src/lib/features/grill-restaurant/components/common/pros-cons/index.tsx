import { cn } from "@/utils/cn";
import { Markdown } from "../markdown";
import { ProsConsList, type Side } from "./pros-cons-list";

export type ProsConsSide = { title: string; items: string[] };

type ProsConsProps = {
  good: ProsConsSide;
  bad: ProsConsSide;
  /** The items' language when it differs from the page's. */
  lang?: string;
  /** The labels' heading level. Defaults to 4, inside a source's result. */
  level?: 3 | 4;
  className?: string;
};

/**
 * What is good and what is bad, side by side from 640px: green plus signs
 * against red minus signs, so the two never blur. A side with nothing in it
 * is left out.
 */
export function ProsCons({
  good,
  bad,
  lang,
  level = 4,
  className,
}: ProsConsProps) {
  const sides: [Side, ProsConsSide][] = [
    ["good", good],
    ["bad", bad],
  ];
  const shown = sides.filter(([, side]) => side.items.length > 0);
  if (shown.length === 0) return null;
  return (
    <div
      className={cn("grid gap-x-6 gap-y-4 sm:grid-cols-2", className)}
      lang={lang}
    >
      {shown.map(([tone, side]) => (
        <ProsConsList key={tone} tone={tone} title={side.title} level={level}>
          {side.items.map((item) => (
            <Markdown key={item} inline>
              {item}
            </Markdown>
          ))}
        </ProsConsList>
      ))}
    </div>
  );
}
