import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { findSecrets, PHONE_LIKE, SECRET_DIGESTS } from "./secretScan";

// A harmless, test-only string whose digest stands in for a real secret.
const CANARY = "clippy-canary-7f3a";
const CANARY_DIGEST = {
  length: CANARY.length,
  sha256: "86d0e04dfcdabc4f00f266c243e20b987b2e15c14e49e2280ff3063cf45eeab0",
};

describe("findSecrets", () => {
  it("canary digest matches the canary", () => {
    expect(createHash("sha256").update(CANARY).digest("hex")).toBe(CANARY_DIGEST.sha256);
  });

  it("flags a planted string anywhere, in any case", () => {
    const digests = [...SECRET_DIGESTS, CANARY_DIGEST];
    expect(findSecrets(`Hi! I'm Clippy-Canary-7F3A, nice.`, digests)).toEqual([CANARY_DIGEST.sha256]);
    expect(findSecrets(`at the end: ${CANARY}`, digests)).toEqual([CANARY_DIGEST.sha256]);
    expect(findSecrets(CANARY.toUpperCase(), digests)).toEqual([CANARY_DIGEST.sha256]);
  });

  it("does not flag clean text", () => {
    expect(findSecrets("Hi! I'm Clippy, nice to meet you.", [...SECRET_DIGESTS, CANARY_DIGEST])).toEqual([]);
  });

  it("flags digits split by separators", () => {
    const digits = { length: 8, sha256: createHash("sha256").update("12345678").digest("hex") };
    expect(findSecrets("call 1234 56-78", [digits])).toEqual([digits.sha256]);
  });
});

describe("PHONE_LIKE", () => {
  it("matches 8+ digit numbers with or without separators", () => {
    expect("call 12345678").toMatch(PHONE_LIKE);
    expect("call +52 81 1234 5678").toMatch(PHONE_LIKE);
    expect("call 1234-5678").toMatch(PHONE_LIKE);
  });

  it("ignores years and short numbers", () => {
    expect("2024–2028, 459 users, Apr 2026").not.toMatch(PHONE_LIKE);
  });
});
