import { describe, expect, it } from "vitest";
import { achievements } from "../achievements";
import { achievementHints, siteGuide } from "./hints";
import { knowledge } from "./knowledge";
import { findSecrets, PHONE_LIKE } from "./secretScan";

const FORBIDDEN = ["iddqd", "konami", "neofetch", "sandwich", "sudo", "five times", "↑", "xkcd", "doom", "ascii", "superuser", "snack", "1993", "nintendo", "extra lives"];
const hinted = achievements.filter((a) => a.id !== "clippy-dismissed");

describe("achievementHints", () => {
  it("has a non-empty hint for every achievement except clippy-dismissed", () => {
    for (const a of hinted) {
      expect(achievementHints[a.id], a.id).toBeTypeOf("string");
      expect(achievementHints[a.id].trim().length, a.id).toBeGreaterThan(0);
    }
    expect(achievementHints["clippy-dismissed"]).toBeUndefined();
  });

  it("never gives away a solution", () => {
    for (const [id, hint] of Object.entries(achievementHints)) {
      const lower = hint.toLowerCase();
      for (const word of FORBIDDEN) {
        expect(lower.includes(word), `${id} contains "${word}"`).toBe(false);
      }
    }
  });

  it("never repeats the achievement description", () => {
    for (const a of hinted) {
      const hint = achievementHints[a.id].toLowerCase();
      expect(hint.includes(a.description.toLowerCase()), a.id).toBe(false);
    }
  });
});

describe("siteGuide and knowledge", () => {
  it("siteGuide does not leak secret triggers", () => {
    const lower = siteGuide.toLowerCase();
    for (const word of [...FORBIDDEN, "secret"]) {
      expect(lower.includes(word), word).toBe(false);
    }
    expect(siteGuide).toContain("m.lopz.montn@gmail.com");
  });

  it("knowledge never includes a phone number", () => {
    expect(knowledge).not.toMatch(PHONE_LIKE);
    expect(findSecrets(knowledge)).toEqual([]);
    expect(knowledge.length).toBeGreaterThan(0);
  });
});
