"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

type ClippyBubbleProps = {
  text: string;
  onAsk: () => void;
  onBrowse: () => void;
  onDismiss: () => void;
  /** The clippyjs agent element the bubble points at. */
  anchor: HTMLElement | null;
};

type Placement = {
  left: number;
  bottom: number;
  width: number;
  tail: number;
};

const MAX_WIDTH = 250;
const GUTTER = 8;
const TAIL_GAP = 14;

function place(anchor: HTMLElement): Placement {
  const rect = anchor.getBoundingClientRect();
  const vw = window.innerWidth;
  const width = Math.min(MAX_WIDTH, vw - GUTTER * 2);
  const center = rect.left + rect.width / 2;
  // Keep the tail roughly 60px from the bubble's right edge (like the
  // mockup), then clamp the whole bubble inside the viewport.
  const preferredLeft = center - (width - 60);
  const left = Math.max(
    GUTTER,
    Math.min(preferredLeft, vw - width - GUTTER)
  );
  const tail = Math.max(
    14,
    Math.min(center - left, width - 14)
  );

  return {
    left: Math.round(left),
    bottom: Math.round(window.innerHeight - rect.top + TAIL_GAP),
    width: Math.round(width),
    tail: Math.round(tail),
  };
}

function samePlacement(a: Placement | null, b: Placement) {
  return (
    !!a &&
    a.left === b.left &&
    a.bottom === b.bottom &&
    a.width === b.width &&
    a.tail === b.tail
  );
}

export function ClippyBubble({
  text,
  onAsk,
  onBrowse,
  onDismiss,
  anchor,
}: ClippyBubbleProps) {
  const [placement, setPlacement] = useState<Placement | null>(null);

  useEffect(() => {
    if (!anchor) return;

    // Follow the agent while the bubble is up (he can be dragged around).
    let frame = 0;
    const tick = () => {
      const next = place(anchor);
      setPlacement((current) =>
        samePlacement(current, next) ? current : next
      );
      frame = window.requestAnimationFrame(tick);
    };
    tick();

    return () => window.cancelAnimationFrame(frame);
  }, [anchor]);

  if (!anchor || !placement) return null;

  return createPortal(
    <div
      className="clippy-bubble"
      role="dialog"
      aria-label="Clippy"
      style={
        {
          left: placement.left,
          bottom: placement.bottom,
          width: placement.width,
          "--clippy-tail": `${placement.tail}px`,
        } as CSSProperties
      }
    >
      <p>{text}</p>
      <ul>
        <li>
          <button type="button" onClick={onAsk}>
            Ask Clippy about Max
          </button>
        </li>
        <li>
          <button type="button" onClick={onBrowse}>
            Just browsing, thanks
          </button>
        </li>
        <li>
          <button type="button" onClick={onDismiss}>
            Leave me alone
          </button>
        </li>
      </ul>
    </div>,
    document.body
  );
}
