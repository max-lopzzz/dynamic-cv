import { createHash } from "node:crypto";
import type { RedisClientType } from "redis";

export const VISITOR_DAILY_LIMIT = 20;
export const GLOBAL_DAILY_LIMIT = 500;

const TTL_SECONDS = 26 * 60 * 60;

export type LimitResult =
  { ok: true } | { ok: false; reason: "visitor" | "global" };

async function bump(
  redis: Pick<RedisClientType, "incr" | "expire">,
  key: string,
): Promise<number> {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, TTL_SECONDS);
  return count;
}

export async function checkLimits(
  redis: Pick<RedisClientType, "incr" | "expire">,
  ip: string,
  now: Date,
): Promise<LimitResult> {
  const day = now.toISOString().slice(0, 10);
  const hash = createHash("sha256").update(ip).digest("hex");

  if ((await bump(redis, `clippy:rate:${hash}:${day}`)) > VISITOR_DAILY_LIMIT) {
    return { ok: false, reason: "visitor" };
  }
  if ((await bump(redis, `clippy:global:${day}`)) > GLOBAL_DAILY_LIMIT) {
    return { ok: false, reason: "global" };
  }
  return { ok: true };
}
