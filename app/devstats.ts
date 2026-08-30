export type DevStat = {
  emoji: string;
  label: string;
  value: string;
};

// Freeform stats — edit these whenever. "projects" and "repos" below are
// computed automatically from projects.ts, so you don't need to touch those.
export const funStats: DevStat[] = [
  { emoji: "☕", label: "coffee consumed", value: "∞" },
  { emoji: "🐛", label: "bugs fixed", value: "too many to count" },
  { emoji: "🍄", label: "bugs created", value: "also too many" },
  { emoji: "🌙", label: "avg bedtime", value: '"soon"' },
];
