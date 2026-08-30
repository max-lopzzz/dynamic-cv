"use client";

import { useRef, useState } from "react";

const CAN_TRANSFORM = () =>
  typeof window !== "undefined" && window.innerWidth > 700;

type Position = {
  top: number;
  left: number;
};

type Size = {
  width: number;
  height: number;
};

type DragState = {
  x: number;
  y: number;
  top: number;
  left: number;
};

type ResizeState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function Window({
  id = "win",
  title,
  children,
  className = "",
  onClose,
  zIndex = 20,
  onFocus = () => {},
  resizable = true,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  zIndex?: number;
  onFocus?: (id: string) => void;
  resizable?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);

  const [pos, setPos] = useState<Position | null>(null);
  const [size, setSize] = useState<Size | null>(null);

  const drag = useRef<DragState | null>(null);
  const resize = useRef<ResizeState | null>(null);

  function beginDrag(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    if (!CAN_TRANSFORM()) return;
    if (!ref.current) return;

    onFocus(id);

    const rect = ref.current.getBoundingClientRect();

    drag.current = {
      x: e.clientX,
      y: e.clientY,
      top: rect.top,
      left: rect.left,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onDragMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;

    setPos({
      top: drag.current.top + (e.clientY - drag.current.y),
      left: drag.current.left + (e.clientX - drag.current.x),
    });
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (
      drag.current &&
      e.currentTarget.hasPointerCapture(e.pointerId)
    ) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    drag.current = null;
  }

  function beginResize(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();

    if (!CAN_TRANSFORM()) return;
    if (!ref.current) return;

    onFocus(id);

    const rect = ref.current.getBoundingClientRect();

    resize.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onResizeMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!resize.current) return;

    setSize({
      width: Math.max(
        240,
        resize.current.width + (e.clientX - resize.current.x)
      ),
      height: Math.max(
        160,
        resize.current.height + (e.clientY - resize.current.y)
      ),
    });
  }

  function endResize(e: React.PointerEvent<HTMLDivElement>) {
    if (
      resize.current &&
      e.currentTarget.hasPointerCapture(e.pointerId)
    ) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    resize.current = null;
  }

  const style: React.CSSProperties = {
    zIndex,

    ...(pos
      ? {
          position: "absolute",
          top: pos.top,
          left: pos.left,
          right: "auto",
          bottom: "auto",
        }
      : {}),

    ...(size
      ? {
          width: size.width,
          height: size.height,
        }
      : {}),
  };

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`window ${className}`}
      style={style}
      onPointerDown={() => onFocus(id)}
    >
      <div
        className="titlebar"
        onPointerDown={beginDrag}
        onPointerMove={onDragMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span>{title}</span>

        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          ×
        </button>
      </div>

      {children}

      {resizable && (
        <div
          className="resize-handle"
          onPointerDown={beginResize}
          onPointerMove={onResizeMove}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          aria-hidden="true"
        />
      )}
    </section>
  );
}
