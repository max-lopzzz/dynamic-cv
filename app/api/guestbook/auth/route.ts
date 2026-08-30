import { NextRequest, NextResponse } from "next/server";
import { createClient, type RedisClientType } from "redis";

const REDIS_URL =
  process.env.KV_REDIS_URL || process.env.REDIS_URL;

const MODERATION_PASSWORD =
  process.env.MODERATION_PASSWORD;

const MODERATION_SESSION_SECRET =
  process.env.MODERATION_SESSION_SECRET;

const RATE_LIMIT_PREFIX = "guestbook:auth-rate:";
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 10;

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

export async function POST(req: NextRequest) {
  if (
    !MODERATION_PASSWORD ||
    !MODERATION_SESSION_SECRET ||
    !REDIS_URL
  ) {
    return NextResponse.json(
      { error: "moderation_not_configured" },
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

  const password =
    body &&
    typeof body === "object" &&
    "password" in body
      ? String(
          (body as { password?: unknown }).password || ""
        )
      : "";

  try {
    const client = await getClient();

    /*
     * Rate limit:
     * 5 failed login attempts per IP every 10 minutes.
     *
     * The counter is only increased when the password
     * is incorrect. Successful logins are never blocked.
     */
    const ip = getClientIp(req);
    const rateKey = `${RATE_LIMIT_PREFIX}${ip}`;

    const attempts = await client.get(rateKey);
    const currentAttempts = attempts
      ? Number(attempts)
      : 0;

    if (currentAttempts >= RATE_LIMIT_MAX) {
      const ttl = await client.ttl(rateKey);

      return NextResponse.json(
        {
          error: "rate_limited",
          retryAfter: Math.max(ttl, 0),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(ttl, 0)
            ),
          },
        }
      );
    }

    if (password !== MODERATION_PASSWORD) {
      const newAttempts = await client.incr(rateKey);

      if (newAttempts === 1) {
        await client.expire(
          rateKey,
          RATE_LIMIT_WINDOW
        );
      }

      const remainingAttempts = Math.max(
        RATE_LIMIT_MAX - newAttempts,
        0
      );

      return NextResponse.json(
        {
          error: "invalid_password",
          remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Successful login: clear any previous failed attempts.
    await client.del(rateKey);

    const response = NextResponse.json({
      ok: true,
    });

    response.cookies.set(
      "guestbook_moderator",
      MODERATION_SESSION_SECRET,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "redis_unreachable" },
      { status: 502 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    ok: true,
  });

  response.cookies.set(
    "guestbook_moderator",
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );

  return response;
}
