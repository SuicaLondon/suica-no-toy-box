/**
 * A rehype plugin that fits a model's Markdown to the page without changing
 * its words: every heading becomes an h3 (the panel's own title is the h2
 * above it), links open in a new tab, and an image becomes its alt text, so
 * nothing a model points at is ever loaded.
 */
import { HEADING_TAG } from "@/utils/regex";

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

function plain(node: HastNode): HastNode {
  if (node.type !== "element") return node;
  if (node.tagName === "img") {
    return { type: "text", value: String(node.properties?.alt ?? "") };
  }
  if (node.tagName && HEADING_TAG.test(node.tagName)) node.tagName = "h3";
  if (node.tagName === "a") {
    node.properties = {
      href: node.properties?.href,
      target: "_blank",
      rel: ["noopener", "noreferrer"],
    };
  }
  node.children = node.children?.map(plain);
  return node;
}

export function rehypePlain() {
  return (tree: HastNode) => {
    tree.children = tree.children?.map(plain);
  };
}
