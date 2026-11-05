import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/redis", () => ({
  redisConfigured: vi.fn(() => true),
  getRedis: vi.fn(async () => ({})),
  getClientIp: vi.fn(() => "1.2.3.4"),
}));
vi.mock("../../clippy/limits", () => ({
  checkLimits: vi.fn(async () => ({ ok: true })),
}));
vi.mock("../../clippy/groq", async (orig) => ({
  ...(await orig<typeof import("../../clippy/groq")>()),
  streamGroq: vi.fn(),
}));

import { POST } from "./route";
import * as redisMod from "../../lib/redis";
import { checkLimits } from "../../clippy/limits";
import { streamGroq } from "../../clippy/groq";
import { buildSystemPrompt } from "../../clippy/prompt";

const sse = (...parts: string[]) =>
  parts
    .map((p) => `data: ${JSON.stringify({ choices: [{ delta: { content: p } }] })}\n\n`)
    .join("") + "data: [DONE]\n\n";

const bytesStream = (text: string) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(new TextEncoder().encode(text));
      c.close();
    },
  });

const req = (body: unknown) =>
  new Request("http://localhost/api/clippy", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const valid = { messages: [{ role: "user", content: "hello" }], unlocked: [] };

beforeEach(() => {
  vi.stubEnv("GROQ_API_KEY", "test-key");
  vi.mocked(redisMod.redisConfigured).mockReturnValue(true);
  vi.mocked(redisMod.getRedis).mockResolvedValue({} as never);
  vi.mocked(checkLimits).mockResolvedValue({ ok: true });
  vi.mocked(streamGroq).mockReset();
  vi.mocked(streamGroq).mockResolvedValue(bytesStream(sse("Hi", " there")));
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/clippy", () => {
  it("503 without GROQ_API_KEY", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const res = await POST(req(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "unavailable" });
    expect(streamGroq).not.toHaveBeenCalled();
  });

  it("503 when redis is not configured", async () => {
    vi.mocked(redisMod.redisConfigured).mockReturnValue(false);
    expect((await POST(req(valid))).status).toBe(503);
    expect(streamGroq).not.toHaveBeenCalled();
  });

  it("503 and no Groq call when getRedis throws", async () => {
    vi.mocked(redisMod.getRedis).mockRejectedValue(new Error("down"));
    expect((await POST(req(valid))).status).toBe(503);
    expect(streamGroq).not.toHaveBeenCalled();
  });

  it("503 and no Groq call when checkLimits throws", async () => {
    vi.mocked(checkLimits).mockRejectedValue(new Error("boom"));
    expect((await POST(req(valid))).status).toBe(503);
    expect(streamGroq).not.toHaveBeenCalled();
  });

  it("400 on invalid body", async () => {
    const res = await POST(req({ nope: true }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "bad_request" });
  });

  it("400 on non-JSON body", async () => {
    const res = await POST(
      new Request("http://localhost/api/clippy", { method: "POST", body: "x" }),
    );
    expect(res.status).toBe(400);
  });

  it("429 limit_visitor and limit_global", async () => {
    vi.mocked(checkLimits).mockResolvedValue({ ok: false, reason: "visitor" });
    let res = await POST(req(valid));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "limit_visitor" });
    vi.mocked(checkLimits).mockResolvedValue({ ok: false, reason: "global" });
    res = await POST(req(valid));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "limit_global" });
  });

  it("503 when Groq fails before streaming", async () => {
    vi.mocked(streamGroq).mockRejectedValue(new Error("groq 500"));
    const res = await POST(req(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "unavailable" });
  });

  it("streams concatenated deltas with system prompt first", async () => {
    const body = { messages: valid.messages, unlocked: ["konami"] };
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(await res.text()).toBe("Hi there");
    const [msgs, opts] = vi.mocked(streamGroq).mock.calls[0];
    expect(msgs[0]).toEqual({ role: "system", content: buildSystemPrompt(body.unlocked) });
    expect(msgs[1]).toEqual({ role: "user", content: "hello" });
    expect(opts.apiKey).toBe("test-key");
  });

  it("drops leading assistant messages", async () => {
    await POST(
      req({
        messages: [
          { role: "assistant", content: "greeting" },
          { role: "user", content: "q" },
        ],
        unlocked: [],
      }),
    );
    const [msgs] = vi.mocked(streamGroq).mock.calls[0];
    expect(msgs.map((m) => m.role)).toEqual(["system", "user"]);
  });

  it("ends the stream gracefully if Groq errors mid-stream", async () => {
    let n = 0;
    const enc = new TextEncoder();
    vi.mocked(streamGroq).mockResolvedValue(
      new ReadableStream<Uint8Array>({
        pull(c) {
          if (n++ === 0) c.enqueue(enc.encode(sse("Part").replace("data: [DONE]\n\n", "")));
          else c.error(new Error("cut"));
        },
      }),
    );
    const res = await POST(req(valid));
    expect(await res.text()).toBe("Part");
  });
});
