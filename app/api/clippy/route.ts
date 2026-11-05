import { NextResponse } from "next/server";
import { checkLimits } from "../../clippy/limits";
import {
  DEFAULT_GROQ_MODEL,
  extractDeltas,
  streamGroq,
} from "../../clippy/groq";
import { guardAnswer } from "../../clippy/guard";
import { buildSystemPrompt } from "../../clippy/prompt";
import { parseChatRequest } from "../../clippy/validate";
import { getClientIp, getRedis, redisConfigured } from "../../lib/redis";

export const runtime = "nodejs";

const unavailable = () =>
  NextResponse.json({ error: "unavailable" }, { status: 503 });

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || !redisConfigured()) {
    return unavailable();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = parseChatRequest(body);
  if (!parsed) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Fail closed: never call Groq without a successful limit check.
  try {
    const redis = await getRedis();
    const result = await checkLimits(redis, getClientIp(req), new Date());
    if (!result.ok) {
      return NextResponse.json(
        { error: `limit_${result.reason}` },
        { status: 429 },
      );
    }
  } catch {
    return unavailable();
  }

  const history = [...parsed.messages];
  while (history.length && history[0].role === "assistant") {
    history.shift();
  }

  let upstream: ReadableStream<Uint8Array>;
  try {
    upstream = await streamGroq(
      [
        { role: "system", content: buildSystemPrompt(parsed.unlocked) },
        ...history,
      ],
      {
        apiKey,
        model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
        signal: req.signal,
      },
    );
  } catch {
    return unavailable();
  }

  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  // The whole answer is collected and checked by guardAnswer before any of
  // it reaches the visitor, so a spoiler can't slip out mid-stream.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answer = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const out = extractDeltas(buffer);
          buffer = out.rest;
          answer += out.deltas.join("");
          if (out.done) {
            await reader.cancel().catch(() => {});
            break;
          }
        }
      } catch {
        // Groq failed mid-stream: send what we have.
      }
      try {
        if (answer) controller.enqueue(encoder.encode(guardAnswer(answer)));
        controller.close();
      } catch {
        // visitor already left
      }
    },
    cancel() {
      return reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
