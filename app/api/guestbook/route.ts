// app/api/guestbook/route.ts — tiny retro guestbook, backed by Vercel's Redis integration.
//
// Env var (auto-injected once you attach a "Redis" store to the project in the Vercel
// dashboard — Storage tab → Create Database → Redis):
//   KV_REDIS_URL   (a redis:// connection string — this is a real TCP Redis, not a REST API)
//
// Without it, GET reports { configured: false } and POST returns 503 — the UI shows a
// friendly "not wired up yet" message instead of crashing.
// This must run on the Node.js runtime (the default for route handlers) since it opens a
// real TCP socket — it will NOT work on the Edge runtime.

import { NextRequest, NextResponse } from "next/server";
import { createClient, type RedisClientType } from "redis";

const REDIS_URL = process.env.KV_REDIS_URL || process.env.REDIS_URL;
const KEY = "guestbook:entries";
const MAX_ENTRIES = 50;
const NAME_MAX = 40;
const MESSAGE_MAX = 240;

type Entry = { name: string; message: string; ts: number };

function configured() {
  return Boolean(REDIS_URL);
}

// Reuse one connection across invocations (serverless functions get reused between
// requests on the same warm instance) instead of opening a new TCP connection every time.
let clientPromise: Promise<RedisClientType> | null = null;

async function getClient(): Promise<RedisClientType> {
  if (!REDIS_URL) throw new Error("not_configured");
  if (!clientPromise) {
    const client = createClient({ url: REDIS_URL }) as RedisClientType;
    client.on("error", () => { /* swallow — surfaced via the try/catch at the call site */ });
    clientPromise = client.connect().then(() => client).catch((err) => { clientPromise = null; throw err; });
  }
  return clientPromise;
}

export async function GET() {
  if (!configured()) return NextResponse.json({ entries: [], configured: false });
  try {
    const client = await getClient();
    const raw = await client.lRange(KEY, 0, MAX_ENTRIES - 1);
    const entries: Entry[] = raw
      .map((s) => { try { return JSON.parse(s); } catch { return null; } })
      .filter(Boolean);
    return NextResponse.json({ entries, configured: true });
  } catch {
    return NextResponse.json({ entries: [], configured: true, error: "redis_unreachable" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!configured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  // Honeypot: a real visitor never fills this hidden field. Silently accept-and-drop bots.
  if (typeof b.website === "string" && b.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = String(b.name || "").trim().slice(0, NAME_MAX);
  const message = String(b.message || "").trim().slice(0, MESSAGE_MAX);
  if (!name || !message) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const entry: Entry = { name, message, ts: Date.now() };
  try {
    const client = await getClient();
    await client.lPush(KEY, JSON.stringify(entry));
    await client.lTrim(KEY, 0, MAX_ENTRIES - 1);
  } catch {
    return NextResponse.json({ error: "redis_unreachable" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, entry });
}
