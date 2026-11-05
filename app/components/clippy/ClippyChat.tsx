"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";

import { loadUnlockedAchievements } from "../../achievements";
import { greetingFor } from "../../clippy/greeting";
import { splitOpenTokens } from "../../clippy/openTokens";
import { MAX_HISTORY, MAX_INPUT_CHARS } from "../../clippy/validate";
import {
  canOpenOnScreen,
  type OpenableWindow,
} from "../../clippy/windows";
import { Window } from "../Window";
import type { ClippyHandle } from "./ClippyAgent";

// Window titles as page.tsx renders them, for the "Open <title>" buttons.
export const OPENABLE_WINDOW_TITLES: Record<OpenableWindow, string> = {
  about: "about_max.txt",
  now: "now.exe",
  portfolio: "max_portfolio.exe",
  music: "tiny media player",
  hobbies: "hobbies.exe",
  guestbook: "guestbook.exe",
  earth: "earth.exe",
  terminal: "terminal.exe",
  hireMe: "hire_me.exe",
  devStats: "devstats.exe",
  wall: "kind_words.exe",
  achievements: "achievements.exe",
};


const ERROR_LINES = {
  limit:
    "Whew, I've talked too much today! Try again tomorrow, or reach Max through hire_me.exe.",
  unavailable:
    "I'm taking a little nap right now. You can still reach Max through hire_me.exe!",
  bad_request: "Hmm, I didn't catch that. Try asking again?",
} as const;

type ChatEntry = {
  role: "user" | "assistant";
  content: string;
  /** Client-only lines (errors): shown, never sent back to the model. */
  local?: boolean;
};

function errorLine(error: unknown): string {
  if (error === "limit_visitor" || error === "limit_global") {
    return ERROR_LINES.limit;
  }
  if (error === "bad_request") return ERROR_LINES.bad_request;
  return ERROR_LINES.unavailable;
}

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    return errorLine(body.error);
  } catch {
    return ERROR_LINES.unavailable;
  }
}

type ClippyChatProps = {
  onClose: () => void;
  /** "Leave me alone": Clippy says goodbye and hides for the session. */
  onLeave: () => void;
  onOpenWindow: (id: OpenableWindow) => void;
  /** Ref to the Clippy agent (read when playing animations, not in render). */
  clippy: RefObject<ClippyHandle | null>;
  zIndex?: number;
  onFocus?: (id: string) => void;
};

export function ClippyChat({
  onClose,
  onLeave,
  onOpenWindow,
  clippy,
  zIndex,
  onFocus,
}: ClippyChatProps) {
  const [log, setLog] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  // Read on the client only: the chat never renders on the server.
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [greeting] = useState(() =>
    greetingFor(navigator.languages?.length ? navigator.languages : [navigator.language]),
  );

  // Synchronous guard so a double Enter can't send twice before re-render.
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
    // Closing the window (End conversation or ×) unmounts us: stop streaming.
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  async function send(e?: FormEvent) {
    e?.preventDefault();

    const question = input.trim();
    if (!question || busyRef.current) return;

    busyRef.current = true;
    setStreaming(true);
    setInput("");

    const history = [
      ...log
        .filter((m) => !m.local && m.content.trim() !== "")
        .map(({ role, content }) => ({ role, content })),
      { role: "user" as const, content: question },
    ].slice(-MAX_HISTORY);

    setLog((current) => [
      ...current,
      { role: "user", content: question },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;
    clippy.current?.play("Thinking");

    const appendClippy = (entry: ChatEntry) =>
      setLog((current) => [...current, entry]);

    let answer = "";

    try {
      const res = await fetch("/api/clippy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          unlocked: loadUnlockedAchievements(),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        appendClippy({
          role: "assistant",
          content: res.ok
            ? ERROR_LINES.unavailable
            : await readError(res),
          local: true,
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (controller.signal.aborted) return;
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        if (!answer) {
          clippy.current?.play("Writing");
          answer = chunk;
          appendClippy({ role: "assistant", content: answer });
        } else {
          answer += chunk;
          const text = answer;
          setLog((current) => [
            ...current.slice(0, -1),
            { role: "assistant", content: text },
          ]);
        }
      }

      if (!answer.trim()) {
        appendClippy({
          role: "assistant",
          content: ERROR_LINES.unavailable,
          local: true,
        });
      }
    } catch {
      if (controller.signal.aborted) return;
      // Network failure: keep any partial answer, otherwise take a nap.
      if (!answer.trim()) {
        appendClippy({
          role: "assistant",
          content: ERROR_LINES.unavailable,
          local: true,
        });
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      if (!controller.signal.aborted) {
        busyRef.current = false;
        setStreaming(false);
        inputRef.current?.focus();
      }
    }
  }

  const canSend = input.trim() !== "" && !streaming;

  return (
    <Window
      id="clippy"
      title="Clippy"
      className="clippy-chat"
      zIndex={zIndex}
      onFocus={onFocus}
      onClose={onClose}
      resizable={false}
    >
      <form className="clippy-chat-body" onSubmit={send}>
        <div
          className="clippy-chat-log"
          ref={logRef}
          role="log"
          aria-live="polite"
        >
          <p className="clippy-chat-msg">
            <b>Clippy</b>
            {greeting}
          </p>

          {log.map((entry, index) => (
            <p key={index} className="clippy-chat-msg">
              <b>{entry.role === "user" ? "You" : "Clippy"}</b>
              {entry.role === "user"
                ? entry.content
                : splitOpenTokens(entry.content).map((part, i) =>
                    part.type === "text" ? (
                      <span key={i}>{part.text}</span>
                    ) : !canOpenOnScreen(
                        part.id as OpenableWindow,
                        viewportWidth
                      ) ? null : (
                      <button
                        key={i}
                        type="button"
                        className="bevel clippy-chat-open"
                        onClick={() =>
                          onOpenWindow(part.id as OpenableWindow)
                        }
                      >
                        Open{" "}
                        {
                          OPENABLE_WINDOW_TITLES[
                            part.id as OpenableWindow
                          ]
                        }
                      </button>
                    )
                  )}
            </p>
          ))}

          {streaming &&
            log[log.length - 1]?.role === "user" && (
              <p className="clippy-chat-msg clippy-chat-thinking">
                <b>Clippy</b>…
              </p>
            )}
        </div>

        <div className="clippy-chat-controls">
          <input
            ref={inputRef}
            className="clippy-chat-input"
            value={input}
            maxLength={MAX_INPUT_CHARS}
            placeholder="Type your question here…"
            aria-label="Ask Clippy a question"
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="clippy-chat-buttons">
            <button
              type="button"
              className="bevel"
              onClick={onClose}
            >
              End conversation
            </button>
            <button
              type="button"
              className="bevel"
              onClick={onLeave}
            >
              Leave me alone
            </button>
            <button
              type="submit"
              className="bevel"
              disabled={!canSend}
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </Window>
  );
}
