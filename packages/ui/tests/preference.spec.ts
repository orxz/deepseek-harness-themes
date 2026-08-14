import { describe, expect, it } from "vitest";
import {
  DEFAULT_SELECTION,
  isThemeSelection,
  THEME_FIELD,
  THEMES_NAMESPACE,
} from "../src/preference.ts";

describe("preference contract", () => {
  it("owns the dsh-themes namespace with a theme field defaulting to system", () => {
    expect(THEMES_NAMESPACE).toBe("dsh-themes");
    expect(THEME_FIELD).toBe("theme");
    expect(DEFAULT_SELECTION).toBe("system");
  });

  it("accepts any string as a theme selection and rejects non-strings", () => {
    expect(isThemeSelection("catppuccin")).toBe(true);
    expect(isThemeSelection("system")).toBe(true);
    expect(isThemeSelection("")).toBe(true);
    expect(isThemeSelection(42)).toBe(false);
    expect(isThemeSelection(null)).toBe(false);
    expect(isThemeSelection(undefined)).toBe(false);
    expect(isThemeSelection({ theme: "catppuccin" })).toBe(false);
  });
});
