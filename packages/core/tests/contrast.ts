/**
 * WCAG 2.1 relative-luminance contrast maths and the surface/text pairings
 * this catalog is held to. Test-only: the thresholds are a repository quality
 * gate, not part of the published API.
 */

import type { ThemeDefinition } from "../src/types.ts";

/** Surfaces that normal (non-inverted) label text sits on. */
export const CONTENT_SURFACES = [
  "--dsw-alias-bg-base",
  "--dsw-alias-bg-layer-1",
  "--dsw-alias-bg-layer-2",
  "--dsw-specific-bubble",
  "--dsw-alias-markdown-code-block",
  "--dsw-specific-sidebar-fill",
] as const;

/**
 * Text tokens and the ratio each must clear against every content surface.
 *
 * Primary and secondary labels carry body copy and hold WCAG AA (4.5:1).
 * Tertiary and caption are de-emphasised metadata held at 3:1 — readable, and
 * below AA, which is the price of keeping the upstream palettes these themes
 * are named after. `docs/theme-spec.md` states the same contract.
 */
export const LABEL_BARS: Readonly<Record<string, number>> = {
  "--dsw-alias-label-primary": 4.5,
  "--dsw-alias-label-secondary": 4.5,
  "--dsw-alias-label-tertiary": 3,
  "--dsw-alias-label-caption": 3,
};

/** Accent tokens, held at 3:1 against the base surface: icons, borders, dots. */
export const ACCENT_BAR = 3;

export const ACCENT_TOKENS = [
  "--dsw-alias-brand-primary",
  "--dsw-alias-state-business-primary",
  "--dsw-alias-state-success-primary",
  "--dsw-alias-state-warn-primary",
  "--dsw-alias-state-error-primary",
] as const;

/** One token pair that failed its bar. */
export interface ContrastFailure {
  theme: string;
  token: string;
  surface: string;
  ratio: number;
  bar: number;
}

/**
 * Parse a six-digit hex colour.
 * @param value - token value; only opaque hex participates in the gate.
 * @returns the RGB triple, or undefined when the value is not opaque hex.
 */
function parseHex(value: string): [number, number, number] | undefined {
  const match = /^#([\da-f]{6})$/i.exec(value.trim());
  if (match === null) return undefined;
  const packed = Number.parseInt(match[1] as string, 16);
  return [(packed >> 16) & 255, (packed >> 8) & 255, packed & 255];
}

/** WCAG relative luminance of one RGB triple. */
function luminance([red, green, blue]: [number, number, number]): number {
  const channel = (raw: number): number => {
    const unit = raw / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  );
}

/**
 * WCAG contrast ratio between two colours.
 * @returns a ratio in [1, 21]; order of the arguments does not matter.
 */
export function contrastRatio(
  foreground: [number, number, number],
  background: [number, number, number],
): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return ((lighter as number) + 0.05) / ((darker as number) + 0.05);
}

/**
 * Check one theme against every bar.
 * @param theme - a shipped theme definition.
 * @returns every pairing that fell below its bar, empty when the theme passes.
 */
export function auditTheme(theme: ThemeDefinition): ContrastFailure[] {
  const failures: ContrastFailure[] = [];
  const surfaces = CONTENT_SURFACES.map((name) => ({
    name,
    rgb: parseHex(theme.tokens[name] ?? ""),
  }));

  for (const [token, bar] of Object.entries(LABEL_BARS)) {
    const rgb = parseHex(theme.tokens[token] ?? "");
    if (rgb === undefined) continue;
    for (const surface of surfaces) {
      if (surface.rgb === undefined) continue;
      const ratio = contrastRatio(rgb, surface.rgb);
      if (ratio >= bar) continue;
      failures.push({
        theme: theme.id,
        token,
        surface: surface.name,
        ratio: Number(ratio.toFixed(2)),
        bar,
      });
    }
  }

  const base = parseHex(theme.tokens["--dsw-alias-bg-base"] ?? "");
  if (base !== undefined) {
    for (const token of ACCENT_TOKENS) {
      const rgb = parseHex(theme.tokens[token] ?? "");
      if (rgb === undefined) continue;
      const ratio = contrastRatio(rgb, base);
      if (ratio >= ACCENT_BAR) continue;
      failures.push({
        theme: theme.id,
        token,
        surface: "--dsw-alias-bg-base",
        ratio: Number(ratio.toFixed(2)),
        bar: ACCENT_BAR,
      });
    }
  }
  return failures;
}
