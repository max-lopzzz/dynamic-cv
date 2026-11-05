import { achievements } from "../achievements";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const MAX_INPUT_CHARS = 500;
export const MAX_HISTORY = 6;

const knownIds = new Set<string>(achievements.map((a) => a.id));

export function parseChatRequest(
  body: unknown,
): { messages: ChatMessage[]; unlocked: string[] } | null {
  if (!body || typeof body !== "object") return null;
  const { messages, unlocked } = body as {
    messages?: unknown;
    unlocked?: unknown;
  };
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const cleaned: ChatMessage[] = [];
  for (const m of messages) {
    if (!m || typeof m !== "object") continue;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (
      (role !== "user" && role !== "assistant") ||
      typeof content !== "string"
    )
      continue;
    cleaned.push({ role, content: content.slice(0, MAX_INPUT_CHARS) });
  }

  const last = cleaned[cleaned.length - 1];
  if (!last || last.role !== "user" || last.content.trim() === "") return null;

  return {
    messages: cleaned.slice(-MAX_HISTORY),
    unlocked: Array.isArray(unlocked)
      ? unlocked.filter(
          (id): id is string => typeof id === "string" && knownIds.has(id),
        )
      : [],
  };
}
