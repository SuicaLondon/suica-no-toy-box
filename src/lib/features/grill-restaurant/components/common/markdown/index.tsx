"use client";

import ReactMarkdown from "react-markdown";
import styles from "./prose.module.css";
import { rehypePlain } from "./rehype-plain";

type MarkdownProps = {
  children: string;
  /** For one line inside a sentence or list item: paragraphs stay inline. */
  inline?: boolean;
  /** The text's language when it differs from the page's. */
  lang?: string;
};

/** Renders a model's Markdown. The words are shown exactly as returned. */
export function Markdown({ children, inline = false, lang }: MarkdownProps) {
  const markdown = (
    <ReactMarkdown
      rehypePlugins={[rehypePlain]}
      disallowedElements={inline ? ["p"] : undefined}
      unwrapDisallowed
    >
      {children}
    </ReactMarkdown>
  );
  if (inline) {
    return (
      <span className={styles.inline} lang={lang}>
        {markdown}
      </span>
    );
  }
  return (
    <div className={styles.prose} lang={lang}>
      {markdown}
    </div>
  );
}
