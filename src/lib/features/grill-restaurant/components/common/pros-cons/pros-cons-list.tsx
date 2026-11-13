import { cn } from "@/utils/cn";
import { Children, type ReactNode } from "react";

export type Side = "good" | "bad";

const TONE: Record<Side, { mark: string; colour: string }> = {
  good: { mark: "+", colour: "text-toy-accent" },
  bad: { mark: "−", colour: "text-toy-error" },
};

type ProsConsListProps = {
  tone: Side;
  title: string;
  /** The label's heading level under the card's own headings. */
  level: 3 | 4;
  children: ReactNode;
};

/** One side: its label, then each item behind a plus or minus sign. */
export function ProsConsList({
  tone,
  title,
  level,
  children,
}: ProsConsListProps) {
  const { mark, colour } = TONE[tone];
  const Heading = level === 3 ? "h3" : "h4";
  return (
    <section>
      <Heading
        className={cn("text-label m-0 font-mono uppercase", colour)}
        data-tone={tone}
      >
        {title}
      </Heading>
      <ul className="text-body mt-2 mb-0 grid list-none gap-2 p-0 leading-normal text-pretty">
        {Children.map(children, (child) => (
          <li className="flex gap-2.5">
            <span
              aria-hidden
              className={cn("w-2.5 shrink-0 font-mono font-medium", colour)}
            >
              {mark}
            </span>
            <span className="wrap-anywhere min-w-0">{child}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
