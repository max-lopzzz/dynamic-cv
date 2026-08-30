export type NowItem = {
  emoji: string;
  label: string;
  value: string;
};

// Update this whenever what you're up to changes — nothing else needs to change.
export const nowItems: NowItem[] = [
  { emoji: "💻", label: "coding", value: "PakuPaku — nutrition tracker" },
  { emoji: "🎮", label: "playing", value: "South Park: The Stick of Truth" },
  { emoji: "🎵", label: "listening", value: "Tom Sawyer — Rush" },
  { emoji: "📚", label: "learning", value: "Next.js + Vercel KV" },
  { emoji: "🧸", label: "obsessed with", value: "perler bead patterns" },
];

// Format: "Month Day, Year" — shown at the bottom of the now.exe window.
export const nowUpdatedAt = "August 30, 2026";
