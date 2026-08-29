"use client";

import { FormEvent, useEffect, useState } from "react";
import { beep } from "../sound";

type Entry = {
  id: string;
  name: string;
  message: string;
  ts: number;
};

type Status =
  | "idle"
  | "loading"
  | "sending"
  | "submitted"
  | "error"
  | "unconfigured";

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/guestbook")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;

        setEntries(
          Array.isArray(d.entries) ? d.entries : []
        );

        setStatus(
          d.configured ? "idle" : "unconfigured"
        );
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (
      !name.trim() ||
      !message.trim() ||
      status === "sending"
    ) {
      return;
    }

    setStatus("sending");

    try {
      const r = await fetch("/api/guestbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          message,
          website,
        }),
      });

      if (!r.ok) {
        throw new Error(String(r.status));
      }

      const data = await r.json();

      if (!data.pending) {
        throw new Error("submission_failed");
      }

      setName("");
      setMessage("");

      beep();
      setStatus("submitted");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="guestbook-body">
      <p className="gb-intro">
        Sign in, say hi, leave your mark. 📼
      </p>

      <form
        onSubmit={submit}
        className="gb-form"
      >
        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="your name"
          maxLength={40}
          required
          disabled={
            status === "sending" ||
            status === "unconfigured"
          }
        />

        <textarea
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="leave a message..."
          maxLength={240}
          rows={3}
          required
          disabled={
            status === "sending" ||
            status === "unconfigured"
          }
        />

        {/* honeypot — hidden from real visitors */}
        <input
          value={website}
          onChange={(e) =>
            setWebsite(e.target.value)
          }
          className="gb-honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          name="website"
        />

        <button
          className="bevel"
          disabled={
            status === "sending" ||
            status === "unconfigured"
          }
        >
          {status === "sending"
            ? "signing…"
            : "sign guestbook →"}
        </button>
      </form>

      {status === "submitted" && (
        <div className="gb-note gb-success">
          <strong>
            ♡ message received!
          </strong>
          <br />
          your message is waiting for moderation
          before it appears here. thank you for
          signing my guestbook! 🐾
        </div>
      )}

      {status === "error" && (
        <p className="gb-note">
          couldn&apos;t reach the guestbook —
          try again in a bit?
        </p>
      )}

      {status === "unconfigured" && (
        <p className="gb-note">
          guestbook backend isn&apos;t wired up yet
          — check back soon.
        </p>
      )}

      <div className="gb-entries">
        {status === "loading" && (
          <p className="gb-empty">
            loading…
          </p>
        )}

        {status !== "loading" &&
          status !== "unconfigured" &&
          entries.length === 0 && (
            <p className="gb-empty">
              be the first to sign!
            </p>
          )}

        {entries.map((entry, i) => (
          <div
            key={entry.id + "-" + i}
            className="gb-entry"
          >
            <div className="gb-entry-head">
              <b>{entry.name}</b>

              <time>
                {new Date(
                  entry.ts
                ).toLocaleDateString()}
              </time>
            </div>

            <p>{entry.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}