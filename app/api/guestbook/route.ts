import { NextRequest, NextResponse } from "next/server";
import { createClient, type RedisClientType } from "redis";

const REDIS_URL = process.env.KV_REDIS_URL || process.env.REDIS_URL;

const KEY = "guestbook:entries";
const RATE_LIMIT_PREFIX = "guestbook:rate:";
const MAX_ENTRIES = 50;

const NAME_MAX = 40;
const MESSAGE_MAX = 240;

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 10;

type Entry = {
  name: string;
  message: string;
  ts: number;
};

function configured() {
  return Boolean(REDIS_URL);
}

let clientPromise: Promise<RedisClientType> | null = null;

async function getClient(): Promise<RedisClientType> {
  if (!REDIS_URL) {
    throw new Error("not_configured");
  }

  if (!clientPromise) {
    const client = createClient({
      url: REDIS_URL,
    }) as RedisClientType;

    client.on("error", () => {
      // Errors are handled by the request try/catch.
    });

    clientPromise = client
      .connect()
      .then(() => client)
      .catch((error) => {
        clientPromise = null;
        throw error;
      });
  }

  return clientPromise;
}

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return req.headers.get("x-real-ip") || "unknown";
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export async function GET() {
  if (!configured()) {
    return NextResponse.json({
      entries: [],
      configured: false,
    });
  }

  try {
    const client = await getClient();

    const raw = await client.lRange(
      KEY,
      0,
      MAX_ENTRIES - 1
    );

    const entries: Entry[] = raw
      .map((value) => {
        try {
          return JSON.parse(value) as Entry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is Entry => Boolean(entry));

    return NextResponse.json({
      entries,
      configured: true,
    });
  } catch {
    return NextResponse.json(
      {
        entries: [],
        configured: true,
        error: "redis_unreachable",
      },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!configured()) {
    return NextResponse.json(
      { error: "not_configured" },
      { status: 503 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "bad_request" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "bad_request" },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  /*
   * Honeypot:
   * legitimate visitors should never fill this field.
   * Bots get a successful response, but nothing is stored.
   */
  if (
    typeof data.website === "string" &&
    data.website.trim()
  ) {
    return NextResponse.json({ ok: true });
  }

  const name = cleanText(data.name, NAME_MAX);
  const message = cleanText(data.message, MESSAGE_MAX);

  if (!name || !message) {
    return NextResponse.json(
      { error: "name_and_message_required" },
      { status: 400 }
    );
  }

  if (name.length > NAME_MAX || message.length > MESSAGE_MAX) {
    return NextResponse.json(
      { error: "message_too_long" },
      { status: 400 }
    );
  }

  try {
    const client = await getClient();

    /*
     * Rate limit:
     *
     * 5 submissions per IP every 10 minutes.
     *
     * INCR creates the key if it doesn't exist.
     * EXPIRE only needs to run for the first request.
     */
    const ip = getClientIp(req);
    const rateKey = `${RATE_LIMIT_PREFIX}${ip}`;

    const attempts = await client.incr(rateKey);

    if (attempts === 1) {
      await client.expire(
        rateKey,
        RATE_LIMIT_WINDOW
      );
    }

    if (attempts > RATE_LIMIT_MAX) {
      const ttl = await client.ttl(rateKey);

      return NextResponse.json(
        {
          error: "rate_limited",
          retryAfter: Math.max(ttl, 0),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(ttl, 0)),
          },
        }
      );
    }

    const entry: Entry = {
      name,
      message,
      ts: Date.now(),
    };

    await client.lPush(
      KEY,
      JSON.stringify(entry)
    );

    await client.lTrim(
      KEY,
      0,
      MAX_ENTRIES - 1
    );

    return NextResponse.json({
      ok: true,
      entry,
    });
  } catch {
    return NextResponse.json(
      { error: "redis_unreachable" },
      { status: 502 }
    );
  }
}