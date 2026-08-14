import { describe, expect, it } from "vitest";
import { themes } from "../src/index.ts";
import {
  ACCENT_BAR,
  auditTheme,
  contrastRatio,
  LABEL_BARS,
} from "./contrast.ts";

describe("contrast ratio", () => {
  it("matches the WCAG reference values at both extremes", () => {
    expect(contrastRatio([255, 255, 255], [0, 0, 0])).toBeCloseTo(21, 5);
    expect(contrastRatio([0, 0, 0], [0, 0, 0])).toBeCloseTo(1, 5);
  });

  it("is symmetric in its arguments", () => {
    const a: [number, number, number] = [98, 114, 164];
    const b: [number, number, number] = [40, 42, 54];

    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10);
  });
});

describe("catalog contrast", () => {
  it.each(themes.map((theme) => [theme.id, theme] as const))(
    "holds %s to every text and accent bar",
    (_id, theme) => {
      expect(auditTheme(theme)).toEqual([]);
    },
  );

  it("states the bars the catalog is held to", () => {
    expect(LABEL_BARS["--dsw-alias-label-primary"]).toBe(4.5);
    expect(LABEL_BARS["--dsw-alias-label-secondary"]).toBe(4.5);
    expect(LABEL_BARS["--dsw-alias-label-tertiary"]).toBe(3);
    expect(LABEL_BARS["--dsw-alias-label-caption"]).toBe(3);
    expect(ACCENT_BAR).toBe(3);
  });
});
