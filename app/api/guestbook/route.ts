import { NextRequest, NextResponse } from "next/server";
import { createClient, type RedisClientType } from "redis";

const REDIS_URL = process.env.KV_REDIS_URL || process.env.REDIS_URL;

const KEY = "guestbook:entries";
const MAX_ENTRIES = 50;

const NAME_MAX = 40;
const MESSAGE_MAX = 240;

type EntryStatus = "pending" | "approved" | "rejected";

type Entry = {
  id: string;
  name: string;
  message: string;
  ts: number;
  status: EntryStatus;
};

function configured() {
  return Boolean(REDIS_URL);
}

let clientPromise: Promise<RedisClientType> | null = null;

async function getClient(): Promise<RedisClientType> {
  if (!REDIS_URL) throw new Error("not_configured");

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
      .catch((err) => {
        clientPromise = null;
        throw err;
      });
  }

  return clientPromise;
}

/**
 * Public guestbook.
 *
 * Only approved messages are returned.
 */
export async function GET(req: NextRequest) {
  if (!configured()) {
    return NextResponse.json({
      entries: [],
      configured: false,
    });
  }

  try {
    const client = await getClient();

    const moderation = req.nextUrl.searchParams.get("moderation");

    const raw = await client.lRange(
      KEY,
      0,
      MAX_ENTRIES - 1
    );

    const entries: Entry[] = raw
      .map((s) => {
        try {
          return JSON.parse(s) as Entry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is Entry => Boolean(entry));

    /*
     * Moderation page:
     * return pending messages.
     */
    if (moderation === "pending") {
      return NextResponse.json({
        entries: entries.filter(
          (entry) => entry.status === "pending"
        ),
        configured: true,
      });
    }

    /*
     * Public guestbook:
     * only approved messages.
     *
     * This also keeps compatibility with any old entries
     * that don't have a status yet.
     */
    const approved = entries.filter(
      (entry) =>
        entry.status === "approved"
    );

    return NextResponse.json({
      entries: approved,
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

/**
 * Create a new guestbook message.
 */
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

  const b =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};

  /*
   * Honeypot.
   *
   * Humans should never fill this field.
   * Silently accept and drop bot submissions.
   */
  if (
    typeof b.website === "string" &&
    b.website.trim()
  ) {
    return NextResponse.json({ ok: true });
  }

  const name = String(b.name || "")
    .trim()
    .slice(0, NAME_MAX);

  const message = String(b.message || "")
    .trim()
    .slice(0, MESSAGE_MAX);

  if (!name || !message) {
    return NextResponse.json(
      { error: "bad_request" },
      { status: 400 }
    );
  }

  const entry: Entry = {
    id: crypto.randomUUID(),
    name,
    message,
    ts: Date.now(),

    /*
     * IMPORTANT:
     * New messages start as pending.
     */
    status: "pending",
  };

  try {
    const client = await getClient();

    await client.lPush(
      KEY,
      JSON.stringify(entry)
    );

    await client.lTrim(
      KEY,
      0,
      MAX_ENTRIES - 1
    );
  } catch {
    return NextResponse.json(
      { error: "redis_unreachable" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,

    /*
     * Tell the UI that moderation is required.
     */
    pending: true,
  });
}

/**
 * Moderate an existing message.
 *
 * action:
 *   approve
 *   reject
 */
export async function PATCH(req: NextRequest) {
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

  const b =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};

  const id =
    typeof b.id === "string"
      ? b.id
      : "";

  const action =
    b.action === "approve" ||
    b.action === "reject"
      ? b.action
      : null;

  if (!id || !action) {
    return NextResponse.json(
      { error: "bad_request" },
      { status: 400 }
    );
  }

  try {
    const client = await getClient();

    const raw = await client.lRange(
      KEY,
      0,
      MAX_ENTRIES - 1
    );

    let found = false;

    const updated = raw.map((s) => {
      try {
        const entry = JSON.parse(s) as Entry;

        if (entry.id !== id) {
          return s;
        }

        found = true;

        return JSON.stringify({
          ...entry,
          status:
            action === "approve"
              ? "approved"
              : "rejected",
        });
      } catch {
        return s;
      }
    });

    if (!found) {
      return NextResponse.json(
        { error: "not_found" },
        { status: 404 }
      );
    }

    /*
     * Replace the Redis list with the updated version.
     */
    await client.del(KEY);

    if (updated.length > 0) {
      await client.rPush(KEY, updated);
    }

    return NextResponse.json({
      ok: true,
      status:
        action === "approve"
          ? "approved"
          : "rejected",
    });
  } catch {
    return NextResponse.json(
      { error: "redis_unreachable" },
      { status: 502 }
    );
  }
}