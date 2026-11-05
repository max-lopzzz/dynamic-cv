import { createHash } from "node:crypto";
import type { RedisClientType } from "redis";
import { describe, expect, it } from "vitest";
import { checkLimits } from "./limits";

function fake() {
  const store = new Map<string, number>();
  const expires: [string, number][] = [];
  const redis = {
    incr: async (key: string) => {
      const n = (store.get(key) ?? 0) + 1;
      store.set(key, n);
      return n;
    },
    expire: async (key: string, seconds: number) => {
      expires.push([key, seconds]);
      return true;
    },
  } as unknown as Pick<RedisClientType, "incr" | "expire">;
  return { redis, store, expires };
}

const day1 = new Date("2026-11-05T12:00:00Z");
const day2 = new Date("2026-11-06T00:00:01Z");

describe("checkLimits", () => {
  it("allows 20 per visitor then rejects", async () => {
    const { redis } = fake();
    for (let i = 0; i < 20; i++) {
      expect(await checkLimits(redis, "1.1.1.1", day1)).toEqual({ ok: true });
    }
    expect(await checkLimits(redis, "1.1.1.1", day1)).toEqual({
      ok: false,
      reason: "visitor",
    });
  });

  it("rejected visitor requests do not increment global", async () => {
    const { redis, store } = fake();
    for (let i = 0; i < 25; i++) await checkLimits(redis, "1.1.1.1", day1);
    expect(store.get("clippy:global:2026-11-05")).toBe(20);
  });

  it("enforces the global limit of 500", async () => {
    const { redis } = fake();
    for (let i = 0; i < 500; i++) {
      expect(await checkLimits(redis, `ip-${i}`, day1)).toEqual({ ok: true });
    }
    expect(await checkLimits(redis, "ip-extra", day1)).toEqual({
      ok: false,
      reason: "global",
    });
  });

  it("resets on the next UTC day", async () => {
    const { redis } = fake();
    for (let i = 0; i < 21; i++) await checkLimits(redis, "1.1.1.1", day1);
    expect(await checkLimits(redis, "1.1.1.1", day2)).toEqual({ ok: true });
  });

  it("sets 26h expiry when a counter is created", async () => {
    const { redis, expires } = fake();
    await checkLimits(redis, "1.1.1.1", day1);
    await checkLimits(redis, "1.1.1.1", day1);
    expect(expires).toHaveLength(2);
    expect(expires.every(([, s]) => s === 93600)).toBe(true);
  });

  it("never puts the raw IP in a key", async () => {
    const { redis, store } = fake();
    await checkLimits(redis, "203.0.113.9", day1);
    const hash = createHash("sha256").update("203.0.113.9").digest("hex");
    const keys = [...store.keys()];
    expect(keys.some((k) => k.includes("203.0.113.9"))).toBe(false);
    expect(keys).toContain(`clippy:rate:${hash}:2026-11-05`);
  });
});
