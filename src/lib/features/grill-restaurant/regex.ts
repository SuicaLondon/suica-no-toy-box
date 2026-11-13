/**
 * Regular expressions for Grill Restaurant's own formats: Google Maps links
 * and place cards, Gemini's review text and a check's progress lines.
 * General patterns live in src/utils/regex.ts.
 */

/** google.com, google.co.uk, google.com.sg…, with or without www. or maps. */
export const GOOGLE_HOST =
  /^(www\.|maps\.)?google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/;

/** "!3d<lat>!4d<lng>" in a Maps URL: the place itself. */
export const MAPS_PIN = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/;

/** "@<lat>,<lng>" in a Maps URL: the centre of the map. */
export const MAPS_CENTRE = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;

/** A place "name" that is only coordinates: "1.3200,103.8872". */
export const COORDINATES_ONLY = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

/** The place name in "/maps/place/<name>/…". */
export const MAPS_PLACE_PATH = /\/maps\/place\/([^/]+)/;

/** The search text in "/maps/search/<text>/…". */
export const MAPS_SEARCH_PATH = /\/maps\/search\/([^/]+)/;

/** The "(2026-05-01)" date Gemini appends to a review's text. */
export const REVIEW_DATE_SUFFIX = /\s*\((\d{4}-\d{2}-\d{2})\)\s*$/;

/** "4.3 (715 reviews)" on a Google Maps place card. */
export const RATING_WITH_COUNT = /([\d.]+)\s*\(([\d,]+)\s+reviews?\)/;

/** The value on a place card's "**<field>:** value" line. */
export function placeCardField(field: string): RegExp {
  return new RegExp(`\\*\\*${field}:\\*\\*\\s*([^\\n]+)`);
}

/** The Google Maps source's progress line once its question is answered. */
export const ANSWERED_LINE =
  /^Answered with (\d+) reviews \((\d+) new\) from (\d+) Maps searches(?:: (.*))?$/;

/** A web search's progress line for opening a page or searching within it. */
export const PAGE_ACTION_LINE =
  /^(open_page|find_in_page|open): (https?:\/\/\S+)$/;

/** A Markdown heading line, "### Pros" or "**Pros:**": its text, without the colon. */
export const MARKDOWN_HEADING_LINE =
  /^(?:#{1,6}\s+(.+?)|\*\*(.+?):?\*\*):?\s*$/;

/** A Markdown list item line, "* Fresh broth" or "1. Fresh broth": its text. */
export const MARKDOWN_ITEM_LINE = /^\s*(?:[*+-]|\d+[.)])\s+(.+?)\s*$/;
