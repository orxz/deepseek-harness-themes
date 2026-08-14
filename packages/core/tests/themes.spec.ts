import { describe, expect, it, vi } from "vitest";
import {
  apply as applyClient,
  inject as clientInject,
  type ClientThemeContext,
} from "../src/client.ts";
import { apply, inject, registerThemes, themes } from "../src/index.ts";
import type { ThemeRegistry } from "../src/types.ts";
import {
  RECOMMENDED_TOKENS,
  REQUIRED_TOKENS,
  RESERVED_IDS,
} from "../src/tokens.ts";

/** CSS color syntaxes accepted by the token contract (plus var() indirection). */
const CSS_COLOR =
  /^(#[\da-f]{3,8}|rgb\([\d\s.,%]+\)|rgba\([\d\s.,%]+\)|hsl\([\d\s.,%]+\)|hsla\([\d\s.,%]+\)|var\(--[\w-]+(?:,\s*.+)?\))$/i;

describe("theme registry", () => {
  it("ships exactly the six announced themes", () => {
    expect(themes.map((t) => t.id)).toEqual([
      "deepseek",
      "oled",
      "dracula",
      "catppuccin",
      "tokyo-night",
      "github-dark",
    ]);
  });

  it("keeps every theme id unique and outside the reserved ids", () => {
    const ids = themes.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(RESERVED_IDS).not.toContain(id);
  });

  it("declares a light or dark base palette for every theme", () => {
    for (const theme of themes) {
      expect(["light", "dark"]).toContain(theme.colorScheme);
    }
  });

  it("covers every required token in every theme", () => {
    for (const theme of themes) {
      const missing = REQUIRED_TOKENS.filter(
        (token) => !(token in theme.tokens),
      );
      expect(missing, `theme "${theme.id}" is missing tokens`).toEqual([]);
    }
  });

  it("covers every recommended token in every theme", () => {
    for (const theme of themes) {
      const missing = RECOMMENDED_TOKENS.filter(
        (token) => !(token in theme.tokens),
      );
      expect(missing, `theme "${theme.id}" is missing tokens`).toEqual([]);
    }
  });

  it("keeps every token name inside the recommended vocabulary", () => {
    const vocabulary = new Set<string>(RECOMMENDED_TOKENS);
    for (const theme of themes) {
      for (const name of Object.keys(theme.tokens)) {
        expect(
          vocabulary.has(name),
          `theme "${theme.id}" token "${name}"`,
        ).toBe(true);
      }
    }
  });

  it("limits every token value to a CSS color", () => {
    for (const theme of themes) {
      for (const [name, value] of Object.entries(theme.tokens)) {
        expect(value, `theme "${theme.id}" token "${name}"`).toMatch(CSS_COLOR);
      }
    }
  });

  it("keeps token dictionaries frozen", () => {
    for (const theme of themes) {
      expect(Object.isFrozen(theme)).toBe(true);
      expect(Object.isFrozen(theme.tokens)).toBe(true);
    }
  });
});

describe("required and recommended token sets", () => {
  it("keeps the required set inside the recommended union", () => {
    const recommended = new Set(RECOMMENDED_TOKENS);
    for (const token of REQUIRED_TOKENS)
      expect(recommended.has(token)).toBe(true);
  });

  it("keeps both sets free of duplicates", () => {
    expect(new Set(REQUIRED_TOKENS).size).toBe(REQUIRED_TOKENS.length);
    expect(new Set(RECOMMENDED_TOKENS).size).toBe(RECOMMENDED_TOKENS.length);
  });
});

describe("registerThemes", () => {
  it("registers every theme and returns a disposer that unregisters all of them", () => {
    const disposers: Array<() => void> = [];
    const register = vi.fn(() => {
      const dispose = vi.fn();
      disposers.push(dispose);
      return dispose;
    });
    const registry = { register } as ThemeRegistry;

    const dispose = registerThemes(registry);

    expect(register).toHaveBeenCalledTimes(themes.length);
    expect(disposers).toHaveLength(themes.length);
    for (const d of disposers) expect(d).not.toHaveBeenCalled();
    dispose();
    for (const d of disposers) expect(d).toHaveBeenCalledTimes(1);
  });

  it("registers definitions in catalog order", () => {
    const order: string[] = [];
    const registry = {
      register: (theme: { id: string }) => {
        order.push(theme.id);
      },
    } as unknown as ThemeRegistry;
    registerThemes(registry);
    expect(order).toEqual(themes.map((t) => t.id));
  });

  it("surfaces a duplicate registration as an error from the registry", () => {
    const register = vi.fn(() => {
      throw new Error('theme "x" is already registered');
    });
    expect(() =>
      registerThemes({ register } as unknown as ThemeRegistry),
    ).toThrow("already registered");
  });
});

describe("core host entry", () => {
  it("declares no optional services", () => {
    expect([...inject]).toEqual([]);
  });

  it("exports a no-op apply so the loader can mount the package by name", () => {
    expect(typeof apply).toBe("function");
    expect(() => apply({})).not.toThrow();
  });
});

describe("core client plugin", () => {
  it("declares the theme service as its only injection", () => {
    expect(clientInject).toEqual(["theme"]);
  });

  it("registers all themes through ctx.effect with a label", () => {
    const effect = vi.fn((thunk: () => unknown, _label?: string) => thunk());
    const register = vi.fn();
    const ctx = { effect, theme: { register } } as ClientThemeContext;

    applyClient(ctx);

    expect(effect).toHaveBeenCalledTimes(1);
    expect(effect.mock.calls[0]?.[1]).toBe("dsh-themes-core: register themes");
    expect(register).toHaveBeenCalledTimes(themes.length);
  });
});
