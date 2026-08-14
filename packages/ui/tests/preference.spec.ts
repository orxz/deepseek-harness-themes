import { describe, expect, it } from "vitest";
import {
  DEFAULT_SELECTION,
  isThemeSelection,
  THEME_FIELD,
  THEME_PREFERENCE_SCHEMA,
  THEMES_NAMESPACE,
  type ThemePreferenceSettings,
} from "../src/preference.ts";

describe("preference contract", () => {
  it("owns the dsh-themes namespace with a theme field defaulting to system", () => {
    expect(THEMES_NAMESPACE).toBe("dsh-themes");
    expect(THEME_FIELD).toBe("theme");
    expect(DEFAULT_SELECTION).toBe("system");
  });

  it("accepts any string as a theme selection and rejects non-strings", () => {
    expect(isThemeSelection("midnight")).toBe(true);
    expect(isThemeSelection("system")).toBe(true);
    expect(isThemeSelection("")).toBe(true);
    expect(isThemeSelection(42)).toBe(false);
    expect(isThemeSelection(null)).toBe(false);
    expect(isThemeSelection(undefined)).toBe(false);
    expect(isThemeSelection({ theme: "midnight" })).toBe(false);
  });
});

describe("durable schema", () => {
  it("applies the system default to an empty section", () => {
    expect(THEME_PREFERENCE_SCHEMA({})).toEqual({ theme: "system" });
    expect(THEME_PREFERENCE_SCHEMA()).toEqual({ theme: "system" });
  });

  it("passes a string selection through", () => {
    expect(THEME_PREFERENCE_SCHEMA({ theme: "midnight" })).toEqual({
      theme: "midnight",
    });
  });

  it("rejects non-string values and falls back for null", () => {
    expect(() =>
      THEME_PREFERENCE_SCHEMA({
        theme: 42 as unknown as string,
      } as unknown as ThemePreferenceSettings),
    ).toThrow();
    // The schemastery default covers nullable input with the fallback.
    expect(
      THEME_PREFERENCE_SCHEMA({
        theme: null as unknown as string,
      } as unknown as ThemePreferenceSettings),
    ).toEqual({
      theme: "system",
    });
  });
});
