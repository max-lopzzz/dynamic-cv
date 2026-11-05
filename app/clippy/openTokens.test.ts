import { describe, expect, it } from "vitest";
import { splitOpenTokens } from "./openTokens";

describe("splitOpenTokens", () => {
  it("returns plain text as a single text part", () => {
    expect(splitOpenTokens("Max likes Unity.")).toEqual([
      { type: "text", text: "Max likes Unity." },
    ]);
  });

  it("turns a known [[open:id]] token into an open part", () => {
    expect(splitOpenTokens("See [[open:guestbook]]!")).toEqual([
      { type: "text", text: "See " },
      { type: "open", id: "guestbook" },
      { type: "text", text: "!" },
    ]);
  });

  it("drops tokens with an unknown id", () => {
    expect(splitOpenTokens("Try [[open:bogus]] now")).toEqual([
      { type: "text", text: "Try  now" },
    ]);
  });

  it("holds back an unterminated token at the end of a chunk", () => {
    expect(splitOpenTokens("Look [[open:gue")).toEqual([
      { type: "text", text: "Look " },
    ]);
  });

  it("holds back a partial token opener at the end", () => {
    expect(splitOpenTokens("Look [[op")).toEqual([
      { type: "text", text: "Look " },
    ]);
    expect(splitOpenTokens("Look [")).toEqual([
      { type: "text", text: "Look " },
    ]);
  });

  it("handles several tokens", () => {
    expect(
      splitOpenTokens("[[open:music]] and [[open:hireMe]]"),
    ).toEqual([
      { type: "open", id: "music" },
      { type: "text", text: " and " },
      { type: "open", id: "hireMe" },
    ]);
  });
});
