/**
 * Splits a Markdown answer made only of headed lists, such as Gemini's
 * "### Pros" and "### Cons", into its sections, so each can be laid out on
 * its own. The words are kept exactly as written, headings included.
 */
import { MARKDOWN_HEADING_LINE, MARKDOWN_ITEM_LINE } from "../../regex";

export type AnswerSection = { title: string; items: string[] };

/**
 * The answer's sections, or null when it holds anything else, such as a
 * paragraph or a list without a heading: then it is shown as Markdown.
 */
export function answerSections(markdown: string): AnswerSection[] | null {
  const sections: AnswerSection[] = [];
  for (const line of markdown.split("\n")) {
    if (!line.trim()) continue;
    const heading = MARKDOWN_HEADING_LINE.exec(line.trim());
    if (heading) {
      sections.push({ title: heading[1] ?? heading[2], items: [] });
      continue;
    }
    const item = MARKDOWN_ITEM_LINE.exec(line);
    const current = sections.at(-1);
    if (!item || !current) return null;
    current.items.push(item[1]);
  }
  if (sections.length === 0) return null;
  return sections.every((section) => section.items.length > 0)
    ? sections
    : null;
}
