import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("redisConfigured", () => {
  it("is false when no redis env vars are set", async () => {
    vi.stubEnv("KV_REDIS_URL", "");
    vi.stubEnv("REDIS_URL", "");
    vi.stubEnv("KV_URL", "");
    vi.resetModules();
    const { redisConfigured } = await import("./redis");
    expect(redisConfigured()).toBe(false);
  });

  it("is true when REDIS_URL is set", async () => {
    vi.stubEnv("KV_REDIS_URL", "");
    vi.stubEnv("REDIS_URL", "redis://localhost:6379");
    vi.stubEnv("KV_URL", "");
    const { redisConfigured } = await import("./redis");
    expect(redisConfigured()).toBe(true);
  });
});

describe("getRedis", () => {
  it("throws not_configured without a URL", async () => {
    vi.stubEnv("KV_REDIS_URL", "");
    vi.stubEnv("REDIS_URL", "");
    vi.stubEnv("KV_URL", "");
    const { getRedis } = await import("./redis");
    await expect(getRedis()).rejects.toThrow("not_configured");
  });
});

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", async () => {
    const { getClientIp } = await import("./redis");
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2", "x-real-ip": "3.3.3.3" },
    });
    expect(getClientIp(req)).toBe("1.1.1.1");
  });

  it("falls back to x-real-ip", async () => {
    const { getClientIp } = await import("./redis");
    const req = new Request("http://x", { headers: { "x-real-ip": "3.3.3.3" } });
    expect(getClientIp(req)).toBe("3.3.3.3");
  });

  it("falls back to unknown", async () => {
    const { getClientIp } = await import("./redis");
    expect(getClientIp(new Request("http://x"))).toBe("unknown");
  });
});
