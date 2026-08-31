"use client";

import { beep } from "../sound";

export function Beep({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`bevel ${className}`}
      onClick={() => {
        navigator.vibrate?.(8);
        beep();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}