import { describe, expect, it } from "vitest";
import type { ThemePreferenceSettings } from "../src/preference.ts";
import { THEME_PREFERENCE_SCHEMA } from "../src/schema.ts";

describe("durable schema", () => {
  it("applies the system default to an empty section", () => {
    expect(THEME_PREFERENCE_SCHEMA({})).toEqual({ theme: "system" });
    expect(THEME_PREFERENCE_SCHEMA()).toEqual({ theme: "system" });
  });

  it("passes a string selection through", () => {
    expect(THEME_PREFERENCE_SCHEMA({ theme: "catppuccin" })).toEqual({
      theme: "catppuccin",
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
