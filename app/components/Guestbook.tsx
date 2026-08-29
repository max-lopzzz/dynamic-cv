"use client";

import { FormEvent, useEffect, useState } from "react";
import { beep } from "../sound";

type Entry = {
  name: string;
  message: string;
  ts: number;
};

type Status =
  | "idle"
  | "loading"
  | "sending"
  | "error"
  | "unconfigured"
  | "success";

const MESSAGE_MAX = 240;

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("loading");

  async function loadEntries() {
    setStatus("loading");

    try {
      const response = await fetch("/api/guestbook", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(String(response.status));
      }

      const data = await response.json();

      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setStatus(data.configured ? "idle" : "unconfigured");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/guestbook", {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;

        setEntries(Array.isArray(data.entries) ? data.entries : []);
        setStatus(data.configured ? "idle" : "unconfigured");
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
      status === "sending" ||
      status === "unconfigured"
    ) {
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/guestbook", {
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

      if (!response.ok) {
        throw new Error(String(response.status));
      }

      const data = await response.json();

      if (data.entry) {
        setEntries((old) => [data.entry, ...old].slice(0, 50));
      }

      setMessage("");
      setStatus("success");
      beep();

      window.setTimeout(() => {
        setStatus("idle");
      }, 2500);
    } catch {
      setStatus("error");
    }
  }

  const messageLength = message.length;

  const isBusy =
    status === "loading" ||
    status === "sending" ||
    status === "unconfigured";

  return (
    <div className="guestbook-body">
      <div className="gb-header">
        <div>
          <p className="gb-intro">
            sign in, say hi, leave your mark. 📼
          </p>

          <p className="gb-subtitle">
            {entries.length} signature{entries.length === 1 ? "" : "s"} in the book
          </p>
        </div>

        <button
          type="button"
          className="gb-refresh bevel"
          onClick={loadEntries}
          disabled={status === "loading" || status === "sending"}
          aria-label="Refresh guestbook"
          title="Refresh guestbook"
        >
          ↻
        </button>
      </div>

      <form onSubmit={submit} className="gb-form">
        <label>
          <span>name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            maxLength={40}
            required
            disabled={isBusy}
          />
        </label>

        <label>
          <span>message</span>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="leave a message..."
            maxLength={MESSAGE_MAX}
            rows={3}
            required
            disabled={isBusy}
          />

          <small className="gb-counter">
            {messageLength}/{MESSAGE_MAX}
          </small>
        </label>

        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="gb-honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          name="website"
        />

        <button
          type="submit"
          className="bevel gb-submit"
          disabled={
            isBusy ||
            !name.trim() ||
            !message.trim()
          }
        >
          {status === "sending"
            ? "signing…"
            : status === "loading"
              ? "loading…"
              : "sign guestbook →"}
        </button>
      </form>

      {status === "success" && (
        <p className="gb-note gb-success">
          ✓ message signed! thanks for stopping by ♡
        </p>
      )}

      {status === "error" && (
        <p className="gb-note">
          couldn&apos;t reach the guestbook — try again in a bit?
        </p>
      )}

      {status === "unconfigured" && (
        <p className="gb-note">
          guestbook backend isn&apos;t wired up yet — check back soon.
        </p>
      )}

      <div className="gb-entries">
        {status === "loading" && (
          <p className="gb-empty">loading signatures…</p>
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
            key={`${entry.ts}-${i}`}
            className="gb-entry"
          >
            <div className="gb-entry-head">
              <b>{entry.name}</b>

              <time dateTime={new Date(entry.ts).toISOString()}>
                {new Date(entry.ts).toLocaleDateString()}{" "}
                {new Date(entry.ts).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>

            <p>{entry.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}