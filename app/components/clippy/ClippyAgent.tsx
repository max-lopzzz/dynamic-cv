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
  /** Delay before Clippy first appears (default: 3 s after the desktop). */
  appearDelay?: number;
};

type Agent = Awaited<
  ReturnType<typeof import("clippyjs").initAgent>
>;

export const CLIPPY_APPEAR_MS = 3000;
const FIRST_BUBBLE_MS = 20000;
const REPEAT_BUBBLE_MS = 120000;
const BUBBLE_VISIBLE_MS = 10000;
const BROWSING_BUBBLE_MS = 300000;

const MOBILE_BREAKPOINT = 700;
const MOBILE_SCALE = 0.7;
const EDGE_MARGIN = 12;
const CLICK_SLOP = 4;
const REACT_CHANCE = 0.5;

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
        agentRef.current?.play("GetAttention");

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
      if (moved < CLICK_SLOP) openChat();
    };

    void (async () => {
      const [{ initAgent }, { default: clippy }] = await Promise.all([
        import("clippyjs"),
        import("clippyjs/agents/clippy"),
      ]);
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
      }, appearDelay);
    })();

    scheduleBubble(FIRST_BUBBLE_MS);

    return () => {
      cancelled = true;
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
  }, [openChat, scheduleBubble, clearBubbleTimers]);

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
        if (Math.random() < REACT_CHANCE) agent.play(animation);
      },
      play(animation: string) {
        const agent = agentRef.current;
        if (!agent || hiddenRef.current) return;
        agent.play(animation);
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
