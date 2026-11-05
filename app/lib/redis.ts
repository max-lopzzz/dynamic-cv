import { createClient, type RedisClientType } from "redis";

function getRedisUrl() {
  return (
    process.env.KV_REDIS_URL ||
    process.env.REDIS_URL ||
    process.env.KV_URL
  );
}

export function redisConfigured(): boolean {
  return Boolean(getRedisUrl());
}

let clientPromise: Promise<RedisClientType> | null = null;
let currentClient: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType> {
  const url = getRedisUrl();

  if (!url) {
    throw new Error("not_configured");
  }

  // After giving up on reconnecting the client closes for good: start over.
  if (currentClient && !currentClient.isOpen) {
    clientPromise = null;
    currentClient = null;
  }

  if (!clientPromise) {
    // Fail fast when Redis is unreachable instead of queueing commands.
    const client = createClient({
      url,
      disableOfflineQueue: true,
      socket: {
        connectTimeout: 3000,
        reconnectStrategy: (retries) =>
          retries > 2 ? new Error("redis_unavailable") : 200,
      },
    }) as RedisClientType;
    currentClient = client;

    client.on("error", () => {
      // Errors are handled by the request try/catch.
    });

    clientPromise = client
      .connect()
      .then(() => client)
      .catch((error) => {
        clientPromise = null;
        currentClient = null;
        throw error;
      });
  }

  return clientPromise;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return req.headers.get("x-real-ip") || "unknown";
}
