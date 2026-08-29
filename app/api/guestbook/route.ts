// app/api/guestbook/route.ts
// Retro guestbook with moderation + email notifications.

import { NextRequest, NextResponse } from "next/server";
import { createClient, type RedisClientType } from "redis";
import { Resend } from "resend";

const REDIS_URL = process.env.KV_REDIS_URL || process.env.REDIS_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const PENDING_KEY = "guestbook:pending";
const APPROVED_KEY = "guestbook:approved";

const MAX_ENTRIES = 50;
const NAME_MAX = 40;
const MESSAGE_MAX = 240;

function isModerator(req: NextRequest) {
  return (
    req.cookies.get("guestbook_moderator")?.value ===
    "authenticated"
  );
}

type Entry = {
  id: string;
  name: string;
  message: string;
  ts: number;
  status: "pending" | "approved";
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
      // Errors are handled by the request that is using Redis.
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

function parseEntry(value: string): Entry | null {
  try {
    const parsed = JSON.parse(value);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.message !== "string" ||
      typeof parsed.ts !== "number"
    ) {
      return null;
    }

    return parsed as Entry;
  } catch {
    return null;
  }
}

/**
 * GET
 *
 * Public:
 *   /api/guestbook
 *   → approved messages only
 *
 * Moderation:
 *   /api/guestbook?moderation=pending
 *   → pending messages
 */
export async function GET(req: NextRequest) {
  if (!configured()) {
    return NextResponse.json({
      entries: [],
      configured: false,
    });
  }

    const moderation =
    req.nextUrl.searchParams.get("moderation");

  if (moderation === "pending" && !isModerator(req)) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    );
  }

  try {
    const client = await getClient();

    const moderation =
      req.nextUrl.searchParams.get("moderation");

    const key =
      moderation === "pending"
        ? PENDING_KEY
        : APPROVED_KEY;

    const raw = await client.lRange(
      key,
      0,
      MAX_ENTRIES - 1
    );

    const entries = raw
      .map(parseEntry)
      .filter((entry): entry is Entry => entry !== null);

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

/**
 * POST
 *
 * New messages go into the pending queue.
 * They are NOT publicly visible until approved.
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

  // Honeypot: bots that fill this field are silently ignored.
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
    status: "pending",
  };

  try {
    const client = await getClient();

    await client.lPush(
      PENDING_KEY,
      JSON.stringify(entry)
    );

    await client.lTrim(
      PENDING_KEY,
      0,
      MAX_ENTRIES - 1
    );
  } catch {
    return NextResponse.json(
      { error: "redis_unreachable" },
      { status: 502 }
    );
  }

  // Email notification.
  //
  // Failure to send the notification does NOT make the
  // guestbook submission fail. The message is already safely
  // stored in Redis.
  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);

      await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ||
          "Guestbook <onboarding@resend.dev>",
        to: "m.lopz.montn@gmail.com",
        subject: "🐾 New guestbook message waiting for moderation",
        text: [
          "A new message was submitted to your portfolio guestbook.",
          "",
          `Name: ${name}`,
          `Message: ${message}`,
          "",
          "The message is currently pending moderation.",
          "",
          "Open your moderation panel to approve or reject it.",
        ].join("\n"),
      });
    } catch {
      // Intentionally ignored.
      // The guestbook message is already stored.
    }
  }

  return NextResponse.json({
    ok: true,
    pending: true,
  });
}

/**
 * PATCH
 *
 * Moderation actions:
 *
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

    if (!isModerator(req)) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
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

  const id = String(b.id || "").trim();
  const action = String(b.action || "").trim();

  if (
    !id ||
    (action !== "approve" && action !== "reject")
  ) {
    return NextResponse.json(
      { error: "bad_request" },
      { status: 400 }
    );
  }

  try {
    const client = await getClient();

    const raw = await client.lRange(
      PENDING_KEY,
      0,
      MAX_ENTRIES - 1
    );

    const entry = raw
      .map(parseEntry)
      .find((item) => item?.id === id);

    if (!entry) {
      return NextResponse.json(
        { error: "entry_not_found" },
        { status: 404 }
      );
    }

    // Remove it from pending first.
    await client.lRem(
      PENDING_KEY,
      1,
      JSON.stringify(entry)
    );

    if (action === "approve") {
      const approved: Entry = {
        ...entry,
        status: "approved",
      };

      await client.lPush(
        APPROVED_KEY,
        JSON.stringify(approved)
      );

      await client.lTrim(
        APPROVED_KEY,
        0,
        MAX_ENTRIES - 1
      );
    }

    return NextResponse.json({
      ok: true,
      action,
      entry,
    });
  } catch {
    return NextResponse.json(
      { error: "redis_unreachable" },
      { status: 502 }
    );
  }
}
