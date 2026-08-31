"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  ts: number;
  status: "pending" | "approved" | "rejected";
};

export default function GuestbookModeration() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("checking guestbook.exe...");

    const loadEntries = useCallback(async () => {
      try {
        setLoading(true);
        setNotice("checking redis connection...");

        const response = await fetch(
          "/api/guestbook?moderation=pending",
          {
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          setAuthenticated(false);
          return;
        }

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
    }, []);

    const checkAuthentication = useCallback(async () => {
      try {
        const response = await fetch(
          "/api/guestbook?moderation=pending",
          {
            cache: "no-store",
          }
        );

        if (response.ok) {
          setAuthenticated(true);
          await loadEntries();
        } else {
          setAuthenticated(false);
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }, [loadEntries]);

  useEffect(() => {
    // Authentication is an external side effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuthentication();
  }, [checkAuthentication]);

  async function login(e: FormEvent) {
    e.preventDefault();

    if (!password.trim() || loggingIn) return;

    setLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/guestbook/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      if (!response.ok) {
        setLoginError("wrong password... try again ♡");
        setPassword("");
        return;
      }

      setPassword("");
      setAuthenticated(true);
      await loadEntries();
    } catch {
      setLoginError(
        "couldn't reach guestbook.exe... :("
      );
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/guestbook/auth", {
      method: "DELETE",
    });

    setAuthenticated(false);
    setEntries([]);
    setNotice("logged out ♡");
  }

  async function moderate(
    id: string,
    action: "approve" | "reject"
  ) {
    setBusy(id);

    try {
      const response = await fetch("/api/guestbook", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          action,
        }),
      });

      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }

      if (!response.ok) {
        throw new Error("moderation_failed");
      }

      setEntries((current) =>
        current.filter((entry) => entry.id !== id)
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

  if (checkingAuth) {
    return (
      <main className="guestbook-moderation">
        <section className="moderation-window">
          <header className="window-titlebar">
            <span>
              🐾 guestbook.exe
            </span>
          </header>

          <div className="moderation-content">
            <div className="empty-state">
              <span className="loading-paw">
                🐾
              </span>

              <p>
                starting guestbook.exe...
              </p>

              <small>
                checking authentication
              </small>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="guestbook-moderation">
        <section className="moderation-window moderation-login-window">
          <header className="window-titlebar">
            <span>
              🐾 guestbook.exe
            </span>

            <div className="window-controls">
              <button type="button">
                _
              </button>

              <button type="button">
                □
              </button>

              <button type="button">
                ×
              </button>
            </div>
          </header>

          <div className="moderation-content">
            <div className="moderation-heading">
              <div>
                <p className="eyebrow">
                  SYSTEM UTILITY
                </p>

                <h1>
                  GUESTBOOK LOGIN
                </h1>
              </div>

              <div className="paw">
                🐾
              </div>
            </div>

            <div className="login-terminal">
              <p>
                › guestbook.exe requires authorization
              </p>

              <p>
                › moderator access only
              </p>
            </div>

            <form
              onSubmit={login}
              className="moderation-login-form"
            >
              <label htmlFor="moderation-password">
                PASSWORD
              </label>

              <input
                id="moderation-password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••••••"
                autoComplete="current-password"
                autoFocus
                disabled={loggingIn}
              />

              <button
                type="submit"
                className="moderation-login-button"
                disabled={
                  loggingIn || !password.trim()
                }
              >
                {loggingIn
                  ? "checking..."
                  : "LOGIN ♡"}
              </button>
            </form>

            {loginError && (
              <p className="login-error">
                {loginError}
              </p>
            )}

            <div className="moderation-footer">
              <span>
                guestbook.exe
              </span>

              <span>
                v1.0 ♡
              </span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="guestbook-moderation">
      <section className="moderation-window">
        <header className="window-titlebar">
          <span>
            🐾 guestbook.exe — moderation center
          </span>

          <div className="window-controls">
            <button type="button">
              _
            </button>

            <button type="button">
              □
            </button>

            <button
              type="button"
              onClick={logout}
              title="Log out"
            >
              ×
            </button>
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
              <strong>
                ♡
              </strong>

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