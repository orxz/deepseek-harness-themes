import { describe, expect, it } from "vitest";
import { themes } from "@dshthemes/core";
import { en, zh } from "../src/locales.ts";

describe("picker copy covers the catalog", () => {
  it("names every catalog theme in both dictionaries", () => {
    for (const theme of themes) {
      const key = `theme.${theme.id}` as keyof typeof en;
      expect(en[key], `en is missing ${key}`).toBeTruthy();
      expect(zh[key], `zh is missing ${key}`).toBeTruthy();
    }
  });

  it("keeps no orphan theme entries", () => {
    const catalogKeys = new Set(themes.map((theme) => `theme.${theme.id}`));
    for (const key of Object.keys(en)) {
      if (!key.startsWith("theme.")) continue;
      expect(catalogKeys.has(key), `${key} matches no catalog theme`).toBe(
        true,
      );
    }
  });
});
