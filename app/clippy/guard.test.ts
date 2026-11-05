import { describe, expect, it } from "vitest";
import { guardAnswer, SPOILER_REPLY } from "./guard";

describe("guardAnswer", () => {
  it.each([
    "Try up, up, down, down, left, right, left, right, B, A!",
    "think of the classic “up‑up‑down‑down‑left‑right‑left‑right‑B‑A” pattern",
    "Press ↑ ↑ ↓ ↓ ← → ← → B A on the desktop",
    "Arriba, arriba, abajo, abajo, izquierda, derecha…",
    "Type IDDQD on the desktop",
    "Run `sudo make me a sandwich` in the terminal",
    "Type neofetch in the terminal",
    "Click Start five times fast",
    "Haz clic en Inicio 5 veces",
  ])("replaces an answer that spoils an achievement: %s", (text) => {
    expect(guardAnswer(text)).toBe(SPOILER_REPLY);
  });

  it.each([
    "Yes! Max led the C#/Unity programming for Pedro No Quiere Pagar Impuestos.",
    "Max scaled up the team and kept things moving. Down to earth, too.",
    "Old-school console fans might know a legendary cheat code… try it on the desktop!",
    "",
  ])("leaves a normal answer alone: %s", (text) => {
    expect(guardAnswer(text)).toBe(text);
  });
});
