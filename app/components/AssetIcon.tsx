"use client";

import Image from "next/image";

export function AssetIcon({
  src,
  alt = "",
  size = 32,
}: {
  src: string;
  alt?: string;
  size?: number;
}) {
  return (
    <Image
      className="asset-icon"
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
    />
  );
}