import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_GROQ_MODEL, extractDeltas, GROQ_TIMEOUT_MS, streamGroq } from "./groq";

const chunk = (content: string) =>
  `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;

describe("extractDeltas", () => {
  it("returns deltas of complete chunks in order", () => {
    const r = extractDeltas(chunk("Hel") + chunk("lo"));
    expect(r.deltas).toEqual(["Hel", "lo"]);
    expect(r.rest).toBe("");
    expect(r.done).toBe(false);
  });

  it("returns a trailing partial line in rest", () => {
    const partial = 'data: {"choices":[{"delta":{"con';
    const r = extractDeltas(chunk("Hi") + partial);
    expect(r.deltas).toEqual(["Hi"]);
    expect(r.rest).toBe(partial);
  });

  it("sets done on [DONE]", () => {
    const r = extractDeltas(chunk("x") + "data: [DONE]\n\n");
    expect(r.deltas).toEqual(["x"]);
    expect(r.done).toBe(true);
  });

  it("skips chunks without delta content and malformed lines", () => {
    const noContent = `data: ${JSON.stringify({ choices: [{ delta: { role: "assistant" } }] })}\n\n`;
    const r = extractDeltas(noContent + "data: not-json\n\n" + ": keepalive\n\n" + chunk("ok"));
    expect(r.deltas).toEqual(["ok"]);
  });
});

describe("streamGroq", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts a streaming request and returns the body", async () => {
    const body = new ReadableStream<Uint8Array>();
    const fetchMock = vi.fn(async () => new Response(body, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const out = await streamGroq([{ role: "user", content: "hi" }], {
      apiKey: "k",
      model: "m",
    });
    expect(out).toBe(body);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer k");
    expect(JSON.parse(init.body as string)).toMatchObject({
      model: "m",
      stream: true,
      max_tokens: 300,
      temperature: 0.6,
    });
  });

  it("asks gpt-oss models for low reasoning effort so answers fit max_tokens", async () => {
    const fetchMock = vi.fn(async () => new Response(new ReadableStream(), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await streamGroq([{ role: "user", content: "hi" }], { apiKey: "k", model: "openai/gpt-oss-120b" });
    await streamGroq([{ role: "user", content: "hi" }], { apiKey: "k", model: "m" });
    const bodies = fetchMock.mock.calls.map((c) => JSON.parse((c as unknown as [string, RequestInit])[1].body as string));
    expect(bodies[0].reasoning_effort).toBe("low");
    expect(bodies[1]).not.toHaveProperty("reasoning_effort");
  });

  it("defaults to a model Groq still serves", () => {
    expect(DEFAULT_GROQ_MODEL).toBe("openai/gpt-oss-120b");
  });

  it("always passes an abort signal (upstream timeout) to fetch", async () => {
    const fetchMock = vi.fn(async () => new Response(new ReadableStream(), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await streamGroq([{ role: "user", content: "hi" }], { apiKey: "k", model: "m" });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.signal?.aborted).toBe(false);
  });

  it("uses a 20 s upstream timeout", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new ReadableStream(), { status: 200 })));
    await streamGroq([{ role: "user", content: "hi" }], { apiKey: "k", model: "m" });
    expect(timeout).toHaveBeenCalledWith(GROQ_TIMEOUT_MS);
    expect(GROQ_TIMEOUT_MS).toBe(20000);
    timeout.mockRestore();
  });

  it("aborts the upstream request when the caller's signal aborts", async () => {
    const fetchMock = vi.fn(async () => new Response(new ReadableStream(), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    await streamGroq([{ role: "user", content: "hi" }], {
      apiKey: "k",
      model: "m",
      signal: controller.signal,
    });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
    controller.abort();
    expect(init.signal?.aborted).toBe(true);
  });

  it("throws on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })));
    await expect(
      streamGroq([{ role: "user", content: "hi" }], { apiKey: "k", model: "m" }),
    ).rejects.toThrow();
  });
});
