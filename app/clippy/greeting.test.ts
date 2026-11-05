import { describe, expect, it } from "vitest";
import { GREETINGS, greetingFor } from "./greeting";

describe("greetingFor", () => {
  it("greets Spanish-language browsers in Spanish", () => {
    expect(greetingFor(["es-MX", "en-US"])).toBe(GREETINGS.es);
    expect(greetingFor(["ES"])).toBe(GREETINGS.es);
  });

  it("uses English for everyone else", () => {
    expect(greetingFor(["en-US", "es-MX"])).toBe(GREETINGS.en);
    expect(greetingFor(["de-DE"])).toBe(GREETINGS.en);
    expect(greetingFor([])).toBe(GREETINGS.en);
  });
});
