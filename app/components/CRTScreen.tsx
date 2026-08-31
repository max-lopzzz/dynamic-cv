"use client";

import type { ReactNode } from "react";

type CRTIntensity = "subtle" | "medium" | "strong";

type CRTScreenProps = {
  children: ReactNode;
  intensity?: CRTIntensity;
  className?: string;
};

export function CRTScreen({
  children,
  intensity = "medium",
  className = "",
}: CRTScreenProps) {
  return (
    <div
      className={`crt-screen crt-${intensity} ${className}`.trim()}
    >
      <div className="crt-content">
        {children}
      </div>

      <div
        className="crt-scanlines"
        aria-hidden="true"
      />

      <div
        className="crt-vignette"
        aria-hidden="true"
      />

      <div
        className="crt-flicker"
        aria-hidden="true"
      />
    </div>
  );
}
