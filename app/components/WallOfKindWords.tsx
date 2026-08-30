"use client";

import { useEffect, useState } from "react";

type Entry = {
  name: string;
  message: string;
  ts: number;
};

type Status = "loading" | "idle" | "error" | "unconfigured";

export function WallOfKindWords({
  onSign,
}: {
  onSign: () => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState<Status>("loading");

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

  return (
    <div className="wall-body">
      <p className="wall-intro">
        kind words from people who
        stopped by ♡
      </p>

      <div className="wall-entries">
        {status === "loading" && (
          <p className="wall-empty">
            loading…
          </p>
        )}

        {status === "error" && (
          <p className="wall-empty">
            couldn&apos;t load the wall
            right now — try again in a
            bit?
          </p>
        )}

        {status === "unconfigured" && (
          <p className="wall-empty">
            the guestbook isn&apos;t
            wired up yet — check back
            soon.
          </p>
        )}

        {status === "idle" &&
          entries.length === 0 && (
            <p className="wall-empty">
              no messages yet — be the
              first!
            </p>
          )}

        {status === "idle" &&
          entries.map((entry, i) => (
            <div
              className="wall-card"
              key={`${entry.ts}-${i}`}
            >
              <p className="wall-message">
                &ldquo;{entry.message}
                &rdquo;
              </p>

              <p className="wall-name">
                ♡ {entry.name}
              </p>
            </div>
          ))}
      </div>

      <button
        type="button"
        className="bevel wall-cta"
        onClick={onSign}
      >
        sign guestbook →
      </button>
    </div>
  );
}
