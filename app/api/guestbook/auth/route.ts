import { NextRequest, NextResponse } from "next/server";

const MODERATION_PASSWORD = process.env.MODERATION_PASSWORD;

export async function POST(req: NextRequest) {
  if (!MODERATION_PASSWORD) {
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
    ? String((body as { password?: unknown }).password || "")
    : "";

  console.log(
    "[guestbook auth]",
    "received length:",
    password.length,
    "expected length:",
    MODERATION_PASSWORD.length
  );

  if (password !== MODERATION_PASSWORD) {
    return NextResponse.json(
      { error: "invalid_password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("guestbook_moderator", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set("guestbook_moderator", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
