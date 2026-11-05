import { OPENABLE_WINDOWS } from "./windows";

export type OpenablePart =
  | { type: "text"; text: string }
  | { type: "open"; id: string };

const TOKEN = /\[\[open:([^\]]*)\]\]/g;
const OPENER = "[[open:";
const OPENABLE = new Set<string>(OPENABLE_WINDOWS);

/**
 * Length of a trailing, still-incomplete token ("[", "[[op", "[[open:gue",
 * "[[open:guestbook]") that may finish in the next streamed chunk.
 */
function pendingTailLength(text: string): number {
  const start = text.lastIndexOf("[[open:");

  if (start !== -1 && !text.includes("]]", start)) {
    return text.length - start;
  }

  for (let n = Math.min(OPENER.length - 1, text.length); n > 0; n--) {
    if (OPENER.startsWith(text.slice(-n))) return n;
  }

  return 0;
}

/**
 * Splits Clippy's reply into text and `[[open:<id>]]` parts. Unknown ids are
 * dropped; an unfinished token at the end is held back (not rendered).
 */
export function splitOpenTokens(text: string): OpenablePart[] {
  const visible = text.slice(0, text.length - pendingTailLength(text));
  const parts: OpenablePart[] = [];

  const pushText = (chunk: string) => {
    if (!chunk) return;
    const last = parts[parts.length - 1];
    if (last?.type === "text") last.text += chunk;
    else parts.push({ type: "text", text: chunk });
  };

  let cursor = 0;

  for (const match of visible.matchAll(TOKEN)) {
    pushText(visible.slice(cursor, match.index));
    const id = match[1].trim();
    if (OPENABLE.has(id)) parts.push({ type: "open", id });
    cursor = match.index + match[0].length;
  }

  pushText(visible.slice(cursor));

  return parts;
}
