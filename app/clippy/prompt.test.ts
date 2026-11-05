import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./prompt";
import { OPENABLE_WINDOWS } from "./windows";
import { findSecrets, PHONE_LIKE } from "./secretScan";
import { achievementHints } from "./hints";
import { projects } from "../projects";
import { nowItems } from "../now";
import { achievements } from "../achievements";

describe("buildSystemPrompt", () => {
  it("includes persona, pronouns and unlock hints", () => {
    const p = buildSystemPrompt([]);
    expect(p).toContain("Clippy");
    expect(p).toContain("he/him");
    expect(p).toContain(achievementHints.godmode);
  });

  it("omits hints for unlocked achievements only", () => {
    const p = buildSystemPrompt(["godmode", "not-a-real-id"]);
    expect(p).not.toContain(achievementHints.godmode);
    expect(p).toContain(achievementHints.konami);
  });

  it("says everything is found when all hintable ids are unlocked", () => {
    const p = buildSystemPrompt(Object.keys(achievementHints));
    expect(p).toContain("The visitor has found every achievement already.");
  });

  it("never leaks private strings (checked by digest) or phone numbers", () => {
    const p = buildSystemPrompt([]);
    expect(findSecrets(p)).toEqual([]);
    expect(p).not.toMatch(PHONE_LIKE);
  });

  it("never leaks achievement solutions or descriptions", () => {
    const p = buildSystemPrompt([]).toLowerCase();
    const forbidden = [
      "iddqd", "sudo make me a sandwich", "neofetch", "five times", "konami",
      ...achievements.map((a) => a.description.toLowerCase()),
    ];
    for (const f of forbidden) expect(p, f).not.toContain(f);
  });

  it("forbids inventing facts and giving full solutions", () => {
    const p = buildSystemPrompt([]);
    expect(p).toMatch(/never invent or estimate facts, jobs, dates, numbers or skills/i);
    expect(p).toMatch(/say you don't know and point to Max's contact links/i);
    expect(p).toMatch(/give hints only, never full solutions/i);
    const persona = p.split("\n\n")[0];
    expect(persona).toMatch(/never invent/i);
    expect(persona).toMatch(/never full solutions/i);
  });

  it("includes projects, now items and openable windows", () => {
    const p = buildSystemPrompt([]);
    for (const pr of projects) expect(p).toContain(pr.name);
    for (const n of nowItems) expect(p).toContain(n.value);
    expect(OPENABLE_WINDOWS).toContain("terminal");
    expect(p).toContain("[[open:");
  });
});
