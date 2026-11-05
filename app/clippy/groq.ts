export const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Give up on Groq after this long, even if the visitor is still waiting. */
export const GROQ_TIMEOUT_MS = 20000;

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function extractDeltas(sseText: string): {
  deltas: string[];
  rest: string;
  done: boolean;
} {
  const lines = sseText.split("\n");
  const rest = lines.pop() ?? "";
  const deltas: string[] = [];
  let done = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") {
      done = true;
      break;
    }
    try {
      const content = JSON.parse(payload)?.choices?.[0]?.delta?.content;
      if (typeof content === "string" && content) deltas.push(content);
    } catch {
      // Ignore malformed lines.
    }
  }

  return { deltas, rest, done };
}

export async function streamGroq(
  messages: GroqMessage[],
  opts: { apiKey: string; model: string; signal?: AbortSignal },
): Promise<ReadableStream<Uint8Array>> {
  const timeout = AbortSignal.timeout(GROQ_TIMEOUT_MS);
  const signal = opts.signal
    ? AbortSignal.any([opts.signal, timeout])
    : timeout;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      messages,
      stream: true,
      max_tokens: 300,
      temperature: 0.6,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`groq_${res.status}`);
  }

  return res.body;
}
