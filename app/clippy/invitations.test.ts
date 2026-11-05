import { describe, expect, it } from "vitest";
import { INVITATIONS, nextInvitation } from "./invitations";

describe("invitations", () => {
  it("starts with the classic Office Assistant line", () => {
    expect(nextInvitation(0)).toBe(
      "It looks like you're snooping around Max's CV. Would you like some help?",
    );
  });

  it("cycles back to the first line", () => {
    expect(nextInvitation(INVITATIONS.length)).toBe(nextInvitation(0));
  });

  it("has at least five non-empty lines", () => {
    expect(INVITATIONS.length).toBeGreaterThanOrEqual(5);
    for (const line of INVITATIONS) expect(line.trim().length).toBeGreaterThan(0);
  });
});
