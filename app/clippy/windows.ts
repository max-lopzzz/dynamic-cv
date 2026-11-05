/** Desktop windows Clippy may offer to open with `[[open:<id>]]`. */
export const OPENABLE_WINDOWS = [
  "about",
  "now",
  "portfolio",
  "music",
  "hobbies",
  "guestbook",
  "earth",
  "terminal",
  "hireMe",
  "devStats",
  "wall",
  "achievements",
] as const;

export type OpenableWindow = (typeof OPENABLE_WINDOWS)[number];

/** Matches the `max-width: 700px` media query in globals.css. */
export const MOBILE_MAX_WIDTH = 700;

/** Windows that globals.css hides (`display: none`) at 700px and below. */
export const MOBILE_HIDDEN_WINDOWS: ReadonlySet<OpenableWindow> = new Set([
  "about",
  "hobbies",
  "terminal",
  "guestbook",
  "earth",
]);

/** Whether an "Open …" button for `id` makes sense at this viewport width. */
export function canOpenOnScreen(id: OpenableWindow, width: number): boolean {
  return width > MOBILE_MAX_WIDTH || !MOBILE_HIDDEN_WINDOWS.has(id);
}
