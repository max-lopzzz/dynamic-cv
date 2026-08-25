"use client";
import { useRef, useState } from "react";

const CAN_TRANSFORM = () => typeof window !== "undefined" && window.innerWidth > 700;

export function Window({
  id = "win", title, children, className = "", onClose, zIndex = 20, onFocus = () => {}, resizable = true,
}: {
  id?: string; title: string; children: React.ReactNode; className?: string; onClose?: () => void;
  zIndex?: number; onFocus?: (id: string) => void; resizable?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const drag = useRef<{ x: number; y: number; top: number; left: number } | null>(null);
  const resize = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  function beginDrag(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    if (!CAN_TRANSFORM()) return;
    onFocus(id);
    const rect = ref.current!.getBoundingClientRect();
    drag.current = { x: e.clientX, y: e.clientY, top: rect.top, left: rect.left };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onDragMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setPos({ top: drag.current.top + (e.clientY - drag.current.y), left: drag.current.left + (e.clientX - drag.current.x) });
  }
  function endDrag() { drag.current = null; }

  function beginResize(e: React.PointerEvent) {
    e.stopPropagation();
    if (!CAN_TRANSFORM()) return;
    onFocus(id);
    const rect = ref.current!.getBoundingClientRect();
    resize.current = { x: e.clientX, y: e.clientY, width: rect.width, height: rect.height };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onResizeMove(e: React.PointerEvent) {
    if (!resize.current) return;
    setSize({
      width: Math.max(240, resize.current.width + (e.clientX - resize.current.x)),
      height: Math.max(160, resize.current.height + (e.clientY - resize.current.y)),
    });
  }
  function endResize() { resize.current = null; }

  const style: React.CSSProperties = {
    zIndex,
    ...(pos ? { position: "absolute", top: pos.top, left: pos.left, right: "auto", bottom: "auto" } : {}),
    ...(size ? { width: size.width, height: size.height } : {}),
  };

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`window ${className}`} style={style} onPointerDown={() => onFocus(id)}>
      <div className="titlebar" onPointerDown={beginDrag} onPointerMove={onDragMove} onPointerUp={endDrag}>
        <span>{title}</span>
        <button onClick={onClose} aria-label="Close window">×</button>
      </div>
      {children}
      {resizable && <div className="resize-handle" onPointerDown={beginResize} onPointerMove={onResizeMove} onPointerUp={endResize} />}
    </section>
  );
}
