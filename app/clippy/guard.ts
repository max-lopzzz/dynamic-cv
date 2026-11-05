// Last line of defense for achievement spoilers. The prompt never contains
// the solutions, but the model knows famous ones (like the Konami code) from
// its own training, so every answer is checked before it reaches the visitor.

export const SPOILER_REPLY =
  "Nice try! I only give hints for achievements 😉 / ¡Buen intento! Solo doy pistas para los logros 😉";

const SEP = String.raw`[\s,.\-‐-―·•→>|/]*`;
const seq = (...words: string[]) => new RegExp(words.join(SEP), "i");

const SPOILERS: RegExp[] = [
  // Konami code (English, Spanish, arrows)
  seq("up", "up", "down", "down"),
  seq("arriba", "arriba", "abajo", "abajo"),
  seq("↑", "↑", "↓", "↓"),
  // God mode
  /iddqd/i,
  // Secret page
  /sudo\s+make\s+me\s+a\s+sandwich/i,
  // Neofetch achievement
  /\bneofetch\b/i,
  // Start button clicks
  /\b(five|5|cinco)\s*(times|clicks|veces|clics)\b/i,
];

export function guardAnswer(text: string): string {
  return SPOILERS.some((re) => re.test(text)) ? SPOILER_REPLY : text;
}
