import { describe, expect, it } from "vitest";
import { canOpenOnScreen, MOBILE_HIDDEN_WINDOWS, OPENABLE_WINDOWS } from "./windows";

describe("canOpenOnScreen", () => {
  it("allows every openable window on wide screens", () => {
    for (const id of OPENABLE_WINDOWS) expect(canOpenOnScreen(id, 1024), id).toBe(true);
  });

  it("hides windows that globals.css hides at 700px and below", () => {
    for (const id of ["about", "hobbies", "terminal", "guestbook", "earth"] as const) {
      expect(MOBILE_HIDDEN_WINDOWS.has(id), id).toBe(true);
      expect(canOpenOnScreen(id, 700), id).toBe(false);
      expect(canOpenOnScreen(id, 701), id).toBe(true);
    }
    expect(canOpenOnScreen("hireMe", 375)).toBe(true);
    expect(canOpenOnScreen("portfolio", 375)).toBe(true);
  });
});
