import { TriangleAlert } from "lucide-react";
import { Alert } from "suica-ui/alert";
import { answerSections } from "../../view/sources/answer-sections";
import { Markdown } from "../common/markdown";
import { ProsCons } from "../common/pros-cons";

type GoogleAnswerProps = {
  /** One of Gemini's answers, as returned or as Gemini translated it. */
  answerText: string;
  /** The language it is written in. */
  lang: string;
};

/** The bad side of an answer that has only a good side. */
const NONE = { title: "", items: [] };

/**
 * Gemini's answer in its own words. Each question asks for headed lists in a
 * fixed order: the good side (pros, or dishes worth ordering), the bad side,
 * then, rarely, where reviews split. The first two are laid out side by side
 * and the third as a warning; an answer of one list is the good side alone.
 * Any other answer is shown as Markdown.
 */
export function GoogleAnswer({ answerText, lang }: GoogleAnswerProps) {
  const sections = answerSections(answerText);
  if (!sections || sections.length > 3) {
    return <Markdown lang={lang}>{answerText}</Markdown>;
  }
  const [good, bad = NONE, divided] = sections;
  return (
    <div className="grid gap-5">
      <ProsCons good={good} bad={bad} lang={lang} />
      {divided ? (
        <Alert
          variant="warning"
          role="note"
          icon={<TriangleAlert aria-hidden="true" />}
          title={divided.title}
          className="items-start"
          lang={lang}
        >
          <ul className="m-0 grid list-none gap-1.5 p-0">
            {divided.items.map((item) => (
              <li key={item}>
                <Markdown inline>{item}</Markdown>
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}
    </div>
  );
}
