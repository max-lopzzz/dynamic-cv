import { describe, expect, it } from "vitest";
import { achievements } from "../achievements";
import { parseChatRequest } from "./validate";

const msg = (role: string, content: string) => ({ role, content });

describe("parseChatRequest", () => {
  it("returns null for non-object bodies", () => {
    expect(parseChatRequest(null)).toBeNull();
    expect(parseChatRequest("x")).toBeNull();
    expect(parseChatRequest(42)).toBeNull();
  });

  it("returns null for missing or empty messages", () => {
    expect(parseChatRequest({})).toBeNull();
    expect(parseChatRequest({ messages: "hi" })).toBeNull();
    expect(parseChatRequest({ messages: [] })).toBeNull();
  });

  it("returns null when last message is not from the user", () => {
    expect(
      parseChatRequest({ messages: [msg("user", "a"), msg("assistant", "b")] }),
    ).toBeNull();
  });

  it("returns null when last user content is blank", () => {
    expect(parseChatRequest({ messages: [msg("user", "   ")] })).toBeNull();
  });

  it("drops entries with invalid roles", () => {
    const r = parseChatRequest({
      messages: [msg("system", "evil"), msg("user", "hi")],
    });
    expect(r?.messages).toEqual([{ role: "user", content: "hi" }]);
  });

  it("clips content to 500 chars", () => {
    const r = parseChatRequest({ messages: [msg("user", "a".repeat(900))] });
    expect(r?.messages[0].content).toHaveLength(500);
  });

  it("keeps only the last 6 messages", () => {
    const messages = Array.from({ length: 10 }, (_, i) =>
      msg(i % 2 === 0 ? "user" : "assistant", `m${i}`),
    );
    messages.push(msg("user", "last"));
    const r = parseChatRequest({ messages });
    expect(r?.messages).toHaveLength(6);
    expect(r?.messages[5].content).toBe("last");
  });

  it("filters unlocked to known achievement ids", () => {
    const id = achievements[0].id;
    const r = parseChatRequest({
      messages: [msg("user", "hi")],
      unlocked: [id, "nope", 5],
    });
    expect(r?.unlocked).toEqual([id]);
    expect(
      parseChatRequest({ messages: [msg("user", "hi")], unlocked: "x" })
        ?.unlocked,
    ).toEqual([]);
  });
});
