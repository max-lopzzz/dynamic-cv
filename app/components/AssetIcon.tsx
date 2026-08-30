"use client";

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
    <img
      className="asset-icon"
      src={src}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
    />
  );
}
