"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";

import { nextInvitation } from "../../clippy/invitations";
import { ClippyBubble } from "./ClippyBubble";

export type ClippyHandle = {
  react(windowId: string): void;
  play(animation: string): void;
  show(): void;
  /** Same as "Leave me alone" in the bubble: say goodbye and hide. */
  leave(): void;
};

type ClippyAgentProps = {
  ref?: Ref<ClippyHandle>;
  onOpenChat: () => void;
  onDismiss: () => void;
  chatOpen: boolean;
  /** Delay before Clippy first appears (default: 0.5 s after the desktop). */
  appearDelay?: number;
};

type Agent = Awaited<
  ReturnType<typeof import("clippyjs").initAgent>
>;

export const CLIPPY_APPEAR_MS = 500;
/** First invitation, counted from when Clippy appears. */
const FIRST_BUBBLE_MS = 6000;
const REPEAT_BUBBLE_MS = 120000;
const BUBBLE_VISIBLE_MS = 10000;
const BROWSING_BUBBLE_MS = 300000;

const MOBILE_BREAKPOINT = 700;
const MOBILE_SCALE = 0.7;
const EDGE_MARGIN = 12;
const CLICK_SLOP = 4;

// Which animation fits each desktop window. Ids match page.tsx's focus ids.
const WINDOW_ANIMATIONS: Record<string, string> = {
  guestbook: "Writing",
  // Clippy's "Hearing_1" is the headphones animation.
  player: "Hearing_1",
  music: "Hearing_1",
  earth: "Searching",
  terminal: "GetTechy",
  hireMe: "GetAttention",
  portfolio: "Explain",
  about: "Greeting",
  now: "CheckingSomething",
  hobbies: "GetArtsy",
  devStats: "Processing",
  wall: "Congratulate",
  achievements: "Congratulate",
};

let modulesPromise: Promise<
  [typeof import("clippyjs"), typeof import("clippyjs/agents/clippy")]
> | null = null;

/** Starts downloading clippyjs early (e.g. during the boot screen). */
export function preloadClippy() {
  modulesPromise ??= Promise.all([
    import("clippyjs"),
    import("clippyjs/agents/clippy"),
  ]);
  return modulesPromise;
}

/**
 * Plays an animation right away. clippyjs otherwise waits for the current
 * idle animation (some loop for a long time) before starting it.
 */
function playNow(agent: Agent, animation: string) {
  agent.stop();
  agent.play(animation);
}

// clippyjs internals used by the freeze watchdog.
type AgentInternals = {
  _queue: { _queue: unknown[]; _active: boolean };
};

const FREEZE_CHECK_MS = 1000;
const FREEZE_AFTER_MS = 5000;

/** Which sprite frame is showing, across clippyjs's overlay layers. */
function frameKey(el: HTMLElement) {
  return [el, ...el.querySelectorAll("div")]
    .map((d) => d.style.backgroundPosition + d.style.display)
    .join("|");
}

/**
 * clippyjs can leave Clippy standing still: some idle animations stop on
 * their last frame until told to exit, and when an idle ends nothing starts
 * the next one. If his frame hasn't changed for a while (and he isn't busy
 * playing something we asked for), cut the idle and play a short animation;
 * once it ends, clippyjs starts a fresh idle. (See freezeTimer below.)
 */
/** True while clippyjs is playing or waiting to play something we queued. */
function isBusy(agent: Agent) {
  const q = (agent as unknown as AgentInternals)._queue;
  return q._active || q._queue.length > 0;
}

function scaleFor(width: number) {
  return width <= MOBILE_BREAKPOINT ? MOBILE_SCALE : 1;
}

function taskbarHeight() {
  const bar = document.querySelector(".taskbar");
  return bar ? bar.getBoundingClientRect().height : 30;
}

export function ClippyAgent({
  ref,
  onOpenChat,
  onDismiss,
  chatOpen,
  appearDelay = CLIPPY_APPEAR_MS,
}: ClippyAgentProps) {
  const agentRef = useRef<Agent | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  const hiddenRef = useRef(true);
  const chatEverOpenedRef = useRef(chatOpen);
  const chatOpenRef = useRef(chatOpen);
  const invitationIndex = useRef(0);
  const nextBubbleTimer = useRef<number | null>(null);
  const hideBubbleTimer = useRef<number | null>(null);

  // Keep the latest callbacks without re-running the agent effect.
  const onOpenChatRef = useRef(onOpenChat);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onOpenChatRef.current = onOpenChat;
    onDismissRef.current = onDismiss;
  });

  const clearBubbleTimers = useCallback(() => {
    if (nextBubbleTimer.current !== null) {
      window.clearTimeout(nextBubbleTimer.current);
      nextBubbleTimer.current = null;
    }
    if (hideBubbleTimer.current !== null) {
      window.clearTimeout(hideBubbleTimer.current);
      hideBubbleTimer.current = null;
    }
  }, []);

  const scheduleBubble = useCallback(
    function schedule(delay: number) {
      if (nextBubbleTimer.current !== null) {
        window.clearTimeout(nextBubbleTimer.current);
      }

      nextBubbleTimer.current = window.setTimeout(() => {
        nextBubbleTimer.current = null;

        if (
          hiddenRef.current ||
          chatOpenRef.current ||
          chatEverOpenedRef.current
        ) {
          return;
        }

        setBubbleText(nextInvitation(invitationIndex.current++));
        if (agentRef.current) playNow(agentRef.current, "GetAttention");

        hideBubbleTimer.current = window.setTimeout(() => {
          hideBubbleTimer.current = null;
          setBubbleText(null);
        }, BUBBLE_VISIBLE_MS);

        schedule(REPEAT_BUBBLE_MS);
      }, delay);
    },
    []
  );

  const openChat = useCallback(() => {
    chatEverOpenedRef.current = true;
    clearBubbleTimers();
    setBubbleText(null);
    onOpenChatRef.current();
  }, [clearBubbleTimers]);

  // Clicking Clippy opens the bubble with its three choices (or closes it).
  const bubbleOpenRef = useRef(false);
  useEffect(() => {
    bubbleOpenRef.current = bubbleText !== null;
  }, [bubbleText]);

  const toggleBubble = useCallback(() => {
    if (hiddenRef.current) return;
    if (hideBubbleTimer.current !== null) {
      window.clearTimeout(hideBubbleTimer.current);
      hideBubbleTimer.current = null;
    }
    if (bubbleOpenRef.current) {
      setBubbleText(null);
      return;
    }
    setBubbleText(nextInvitation(invitationIndex.current++));
    if (agentRef.current) playNow(agentRef.current, "GetAttention");
  }, []);

  // Chat state from the parent: once it has been open, bubbles stop for good.
  useEffect(() => {
    chatOpenRef.current = chatOpen;
    if (chatOpen) {
      chatEverOpenedRef.current = true;
      clearBubbleTimers();
      setBubbleText(null);
    }
  }, [chatOpen, clearBubbleTimers]);

  // Load clippyjs on the client only, and create exactly one agent.
  useEffect(() => {
    let cancelled = false;
    let agent: Agent | null = null;
    let appearTimer: number | null = null;
    let lastFrame = "";
    let stillSince = performance.now();
    const freezeTimer = window.setInterval(() => {
      if (!agent || hiddenRef.current) return;
      const now = performance.now();
      const frame = frameKey(agent._el);
      if (frame !== lastFrame) {
        lastFrame = frame;
        stillSince = now;
        return;
      }
      if (now - stillSince < FREEZE_AFTER_MS || isBusy(agent)) return;
      stillSince = now;
      playNow(agent, "RestPose");
    }, FREEZE_CHECK_MS);
    let pointerStart: { x: number; y: number } | null = null;

    const applyScale = () => {
      if (!agent) return;
      const scale = scaleFor(window.innerWidth);
      agent._el.style.transformOrigin = "bottom right";
      agent._el.style.transform =
        scale === 1 ? "" : `scale(${scale})`;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerStart = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerStart) return;
      const moved = Math.hypot(
        e.clientX - pointerStart.x,
        e.clientY - pointerStart.y
      );
      pointerStart = null;
      if (moved < CLICK_SLOP) toggleBubble();
    };

    void (async () => {
      const [{ initAgent }, { default: clippy }] = await preloadClippy();
      const created = await initAgent(clippy);

      // Strict mode (or a fast unmount) already cleaned up: throw it away.
      if (cancelled) {
        created.dispose();
        return;
      }

      agent = created;
      agentRef.current = created;

      const el = created._el;
      el.classList.add("clippy-agent");
      el.setAttribute("aria-label", "Clippy");

      applyScale();
      // show() only centres the agent when left/top are unset, so place
      // him bottom-right above the taskbar first.
      const [frameW, frameH] = [el.offsetWidth || 124, el.offsetHeight || 93];
      el.style.left = `${window.innerWidth - frameW - EDGE_MARGIN}px`;
      el.style.top = `${
        window.innerHeight - taskbarHeight() - frameH - EDGE_MARGIN
      }px`;

      el.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("resize", applyScale);

      appearTimer = window.setTimeout(() => {
        appearTimer = null;
        if (cancelled) return;
        hiddenRef.current = false;
        created.show(false);
        setAnchor(el);
        scheduleBubble(FIRST_BUBBLE_MS);
      }, appearDelay);
    })();

    return () => {
      cancelled = true;
      window.clearInterval(freezeTimer);
      if (appearTimer !== null) window.clearTimeout(appearTimer);
      clearBubbleTimers();
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", applyScale);
      if (agent) {
        agent._el.removeEventListener("pointerdown", onPointerDown);
        agent.dispose();
      }
      agentRef.current = null;
      hiddenRef.current = true;
    };
    // appearDelay is only read on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleBubble, scheduleBubble, clearBubbleTimers]);

  const handleLeave = useCallback(() => {
    clearBubbleTimers();
    setBubbleText(null);
    hiddenRef.current = true;

    const agent = agentRef.current;
    if (agent) {
      agent.stop();
      agent.play("GoodBye", 5000, () => {
        // Summoned again (clippy.exe) while waving goodbye: stay visible.
        if (hiddenRef.current) agent.hide(true, undefined);
      });
    }

    onDismissRef.current();
  }, [clearBubbleTimers]);

  useImperativeHandle(
    ref,
    () => ({
      react(windowId: string) {
        const animation = WINDOW_ANIMATIONS[windowId];
        const agent = agentRef.current;
        if (!animation || !agent || hiddenRef.current) return;
        playNow(agent, animation);
      },
      play(animation: string) {
        const agent = agentRef.current;
        if (!agent || hiddenRef.current) return;
        playNow(agent, animation);
      },
      show() {
        const agent = agentRef.current;
        if (!agent || !hiddenRef.current) return;
        hiddenRef.current = false;
        // Cut a GoodBye that is still playing so it can't hide him again.
        agent.stop();
        agent.show(false);
        if (!chatEverOpenedRef.current) scheduleBubble(FIRST_BUBBLE_MS);
      },
      leave: handleLeave,
    }),
    [scheduleBubble, handleLeave]
  );

  function handleBrowse() {
    clearBubbleTimers();
    setBubbleText(null);
    scheduleBubble(BROWSING_BUBBLE_MS);
  }

  if (!bubbleText) return null;

  return (
    <ClippyBubble
      text={bubbleText}
      anchor={anchor}
      onAsk={openChat}
      onBrowse={handleBrowse}
      onDismiss={handleLeave}
    />
  );
}
