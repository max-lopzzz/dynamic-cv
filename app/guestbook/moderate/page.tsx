"use client";

import { useEffect, useState } from "react";

type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  ts: number;
  status: "pending" | "approved" | "rejected";
};

export default function GuestbookModeration() {
  const [entries, setEntries] = useState<
    GuestbookEntry[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(
    null
  );

  const [notice, setNotice] = useState(
    "checking guestbook.exe..."
  );

  async function loadEntries() {
    try {
      setLoading(true);
      setNotice("checking redis connection...");

      const response = await fetch(
        "/api/guestbook?moderation=pending",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("request_failed");
      }

      const data = await response.json();

      setEntries(data.entries ?? []);
      setNotice("redis connected ♡");
    } catch {
      setNotice(
        "something went wrong... please try again :("
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function moderate(
    id: string,
    action: "approve" | "reject"
  ) {
    setBusy(id);

    try {
      const response = await fetch(
        "/api/guestbook",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            action,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("moderation_failed");
      }

      setEntries((current) =>
        current.filter(
          (entry) => entry.id !== id
        )
      );

      setNotice(
        action === "approve"
          ? "message approved! ♡"
          : "message rejected!"
      );
    } catch {
      setNotice(
        "oops... something went wrong :("
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="guestbook-moderation">
      <section className="moderation-window">
        <header className="window-titlebar">
          <span>
            🐾 guestbook.exe — moderation center
          </span>

          <div className="window-controls">
            <button type="button">_</button>
            <button type="button">□</button>
            <button type="button">×</button>
          </div>
        </header>

        <div className="moderation-content">
          <div className="moderation-heading">
            <div>
              <p className="eyebrow">
                SYSTEM UTILITY
              </p>

              <h1>
                GUESTBOOK MODERATION
              </h1>
            </div>

            <div className="paw">
              🐾
            </div>
          </div>

          <div className="moderation-stats">
            <div>
              <strong>
                {entries.length}
              </strong>

              <span>
                PENDING
              </span>
            </div>

            <div>
              <strong>♡</strong>

              <span>
                KEEP IT CUTE
              </span>
            </div>
          </div>

          <div className="terminal-status">
            <span>›</span>{" "}
            {notice}
          </div>

          <div className="message-list">
            {loading ? (
              <div className="empty-state">
                <span className="loading-paw">
                  🐾
                </span>

                <p>
                  loading messages...
                </p>
              </div>
            ) : entries.length === 0 ? (
              <div className="empty-state">
                <span>
                  ✨
                </span>

                <p>
                  no messages waiting
                  for moderation!
                </p>

                <small>
                  your guestbook is all
                  caught up ♡
                </small>
              </div>
            ) : (
              entries.map((entry) => (
                <article
                  className="moderation-card"
                  key={entry.id}
                >
                  <div className="message-header">
                    <span className="message-author">
                      ♡ {entry.name}
                    </span>

                    <time>
                      {new Date(
                        entry.ts
                      ).toLocaleString()}
                    </time>
                  </div>

                  <div className="message-body">
                    {entry.message}
                  </div>

                  <div className="message-actions">
                    <button
                      type="button"
                      className="approve-button"
                      disabled={
                        busy === entry.id
                      }
                      onClick={() =>
                        moderate(
                          entry.id,
                          "approve"
                        )
                      }
                    >
                      ✓ APPROVE
                    </button>

                    <button
                      type="button"
                      className="reject-button"
                      disabled={
                        busy === entry.id
                      }
                      onClick={() =>
                        moderate(
                          entry.id,
                          "reject"
                        )
                      }
                    >
                      × REJECT
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <footer className="moderation-footer">
            <span>
              guestbook.exe
            </span>

            <span>
              {entries.length} message
              {entries.length === 1
                ? ""
                : "s"} remaining ♡
            </span>
          </footer>
        </div>
      </section>
    </main>
  );
}