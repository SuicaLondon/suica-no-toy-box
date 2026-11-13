/**
 * Regular expressions any code can use, each named for what it matches. A
 * feature's own formats live in that feature's regex.ts.
 *
 * A global (g) pattern is for replace(): test() and exec() on a shared
 * global pattern carry its lastIndex from one call to the next.
 */

/** A web link anywhere in a text: "https://…" up to the next space. */
export const WEB_LINK = /https?:\/\/\S+/i;

/** A URL scheme at the start of a text: "https://", "ftp://". */
export const LEADING_SCHEME = /^[a-z]+:\/\//i;

/** A leading "www." on a host name. */
export const WWW_PREFIX = /^www\./;

/** Every "+" in a URL, each standing for a space. */
export const URL_PLUS = /\+/g;

/** The extension at the end of a file name: ".jpeg" in "photo.jpeg". */
export const FILE_EXTENSION = /\.[^.]+$/;

/** A line break, \n or \r\n. */
export const LINE_BREAK = /\r?\n/;

/** A blank line: the break between two blocks of text. */
export const BLANK_LINE = /\r?\n\r?\n/;

/** A blank line at the very start of a text. */
export const LEADING_BLANK_LINE = /^\r?\n\r?\n/;

/** The start of every line, for indenting a block of text with replace(). */
export const LINE_START = /^/gm;

/**
 * A run of characters that are neither letters nor digits, in any script: the
 * gaps between words.
 */
export const NON_WORD_RUN = /[^\p{L}\p{N}]+/u;

/** Each parenthetical, with the spaces before it: " (2026)". */
export const PARENTHETICAL = /\s*\([^)]*\)/g;

/** An HTML heading tag: h1 to h6. */
export const HEADING_TAG = /^h[1-6]$/;
