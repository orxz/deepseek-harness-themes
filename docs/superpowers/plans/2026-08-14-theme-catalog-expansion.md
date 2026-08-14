# Theme Catalog Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five new dark themes — solarized, gruvbox, nord, synthwave-84, cobalt2 — to the catalog, growing it from 6 to 11 themes with full picker support, previews, captures, docs, and a changeset.

**Architecture:** Each theme is one frozen `ThemeDefinition` file in `packages/core/src/themes/` registered in the catalog array; the picker in `packages/ui` picks themes up automatically except for locale copy, which a new sync test ties to the catalog. Existing parameterized suites (`themes.spec.ts`, `contrast.spec.ts`, `previews.spec.ts`) already iterate the whole catalog, so no core test files change.

**Tech Stack:** TypeScript (NodeNext, `.ts` imports), Vitest, pnpm workspace (`@dshthemes/core`, `@dshthemes/ui`), changesets.

**Spec:** `docs/superpowers/specs/2026-08-14-theme-catalog-expansion-design.md` (approved).

## Global Constraints

- Every theme file covers exactly the 70 tokens of `REQUIRED_TOKENS` + `RECOMMENDED_TOKENS` from `packages/core/src/tokens.ts`; freeze both the definition and the token dictionary; ids kebab-case and never `light`/`dark`/`system`.
- Contrast gate (see `packages/core/tests/contrast.ts`): `label-primary`/`label-secondary` ≥ 4.5:1 and `label-tertiary`/`label-caption` ≥ 3:1 against all six content surfaces (`bg-base`, `bg-layer-1`, `bg-layer-2`, `bubble`, `markdown-code-block`, `sidebar-fill`); the five accent tokens ≥ 3:1 against `bg-base`. Only opaque 6-digit hex participates; rgba values are exempt. **All dictionaries in this plan were pre-verified against this exact maths — do not improvise different colors; if a test fails, re-check the value against the plan.**
- Locale copy: brand names stay untranslated in both `en` and `zh` (deepseek/OLED precedent): `Solarized`, `Gruvbox`, `Nord`, `Synthwave '84`, `Cobalt2`.
- Every Bash step needs the workspace pnpm on PATH first:
  `export PATH="$PWD/.tooling/node_modules/.bin:/Users/rengang/.local/bin:$PATH"`
- Commit messages: `feat: add <theme> theme` per theme; `test:`/`docs:`/`chore:` for the rest.
- Gate order before finishing: `pnpm test` → `pnpm typecheck` → `pnpm test:coverage` → `pnpm lint` → `pnpm build`.
- Catalog append order (spec): solarized, gruvbox, nord, synthwave84, cobalt2. Export names are camelCase: `solarized`, `gruvbox`, `nord`, `synthwave84`, `cobalt2`.

---

### Task 1: Catalog ↔ picker-copy sync guard test

**Files:**

- Create: `packages/ui/tests/locales.spec.ts`

**Interfaces:**

- Consumes: `themes` (readonly `ThemeDefinition[]`) from `@dshthemes/core`; `en`, `zh` (`Record<PickerKey, string>`) from `../src/locales.ts`.
- Produces: a passing guard that goes red the moment a catalog theme lacks picker copy or a picker entry is orphaned. Tasks 2–6 rely on it to catch missed locale entries.

- [ ] **Step 1: Write the test**

```ts
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
```

- [ ] **Step 2: Run it — expect PASS on the current 6-theme catalog**

Run: `pnpm vitest run packages/ui/tests/locales.spec.ts`
Expected: 2 passed. (This is a guard; its red state appears in Tasks 2–6 if a locale entry is forgotten.)

- [ ] **Step 3: Commit**

```bash
git add packages/ui/tests/locales.spec.ts
git commit -m "test: tie picker copy to the theme catalog"
```

---

### Task 2: solarized theme

**Files:**

- Create: `packages/core/src/themes/solarized.ts`
- Modify: `packages/core/src/themes/index.ts`, `packages/ui/src/locales.ts`
- Generated: `previews/solarized.svg` (by `pnpm previews`)

**Interfaces:**

- Produces: `export const solarized: ThemeDefinition` with `id: "solarized"`; catalog gains a 7th entry; `PickerKey` gains `"theme.solarized"`.

- [ ] **Step 1: Create the theme file** (values pre-verified against the contrast audit)

```ts
import type { ThemeDefinition } from "../types.ts";

/**
 * Solarized Dark: Ethan Schoonover's scientific palette — teal base03
 * surfaces with the solarized yellow accent.
 *
 * Tertiary/caption take base0 `#839496`: the canonical base00/base01 grays
 * reach only ~2.9:1 on base02-family surfaces. Layer steps between base03
 * and base02 (`#05303c`) and above base02 (`#0a4150`, `#0d4858`, `#104f60`)
 * are interpolated; the palette ships no intermediate ladder. Button and
 * state-secondary hovers are lightened variants of their palette entries.
 */
export const solarized: ThemeDefinition = Object.freeze({
  id: "solarized",
  colorScheme: "dark",
  tokens: Object.freeze({
    "--dsw-alias-bg-base": "#002b36",
    "--dsw-alias-bg-layer-1": "#05303c",
    "--dsw-alias-bg-layer-2": "#073642",
    "--dsw-alias-bg-layer-3": "#0a4150",
    "--dsw-alias-bg-overlay": "#0d4858",
    "--dsw-alias-label-primary": "#eee8d5",
    "--dsw-alias-label-secondary": "#93a1a1",
    "--dsw-alias-label-tertiary": "#839496",
    "--dsw-alias-brand-primary": "#b58900",
    "--dsw-alias-state-business-primary": "#268bd2",
    "--dsw-alias-state-success-primary": "#859900",
    "--dsw-alias-state-warn-primary": "#cb4b16",
    "--dsw-alias-state-error-primary": "#dc322f",
    "--dsw-alias-border-l1": "rgba(238, 232, 213, 0.08)",
    "--dsw-alias-border-l2": "rgba(238, 232, 213, 0.15)",
    "--dsw-alias-interactive-bg-hover": "rgba(238, 232, 213, 0.06)",
    "--dsw-alias-interactive-bg-active": "rgba(238, 232, 213, 0.12)",
    "--dsw-alias-button-primary-fill": "#b58900",
    "--dsw-alias-button-primary-hover": "#caa426",
    "--dsw-alias-markdown-code-block": "#05303c",
    "--dsw-alias-markdown-code-block-banner": "#05303c",
    "--dsw-alias-markdown-inline-code": "#0a4150",
    "--dsw-alias-markdown-tag": "#0a4150",
    "--dsw-alias-scrollbar-bg-l1": "#104f60",
    "--dsw-alias-scrollbar-hover-l1": "#586e75",
    "--dsw-alias-tooltip-bg": "#0d4858",
    "--dsw-specific-bubble": "#073642",
    "--dsw-specific-bubble-highlight": "#0a4150",
    "--dsw-specific-sidebar-fill": "#05303c",
    "--dsw-specific-sidebar-nav-item-active": "#073642",
    "--dsw-alias-bg-mask-1": "rgba(0, 0, 0, 0.5)",
    "--dsw-alias-bg-mask-2": "rgba(0, 0, 0, 0.2)",
    "--dsw-alias-bg-mask-3": "rgba(0, 0, 0, 0.48)",
    "--dsw-alias-bg-module-platform": "#073642",
    "--dsw-alias-bg-multi-select": "#05303c",
    "--dsw-alias-bg-skeleton": "rgba(238, 232, 213, 0.08)",
    "--dsw-alias-border-l3": "rgba(238, 232, 213, 0.22)",
    "--dsw-alias-border-l4": "rgba(238, 232, 213, 0.28)",
    "--dsw-alias-border-inverted": "rgba(238, 232, 213, 0.1)",
    "--dsw-alias-button-info-fill": "#268bd2",
    "--dsw-alias-button-info-hover": "#4196da",
    "--dsw-alias-button-elevated-fill": "#05303c",
    "--dsw-alias-button-floating-fill": "#073642",
    "--dsw-alias-button-floating-hover": "#0a4150",
    "--dsw-alias-interactive-bg-hover-solid": "#0a4150",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(220, 50, 47, 0.18)",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(181, 137, 0, 0.24)",
    "--dsw-alias-label-caption": "#839496",
    "--dsw-alias-label-primary-inverted": "#002b36",
    "--dsw-alias-label-primary-dimmed": "#93a1a1",
    "--dsw-alias-label-dimmed": "#0d4858",
    "--dsw-alias-markdown-citation": "#0a4150",
    "--dsw-alias-markdown-code-segment-selected": "#0d4858",
    "--dsw-alias-markdown-code-segment-unselected": "#002b36",
    "--dsw-alias-markdown-placeholder": "#0a4150",
    "--dsw-alias-scrollbar-bg-l2": "#104f60",
    "--dsw-alias-scrollbar-hover-l2": "#586e75",
    "--dsw-alias-state-success-secondary": "#a8b826",
    "--dsw-alias-state-warn-secondary": "#d96b3a",
    "--dsw-alias-state-error-secondary": "#e86a5f",
    "--dsw-alias-state-success-tertiary": "#1c3323",
    "--dsw-alias-state-warn-tertiary": "#3a2c1c",
    "--dsw-alias-state-business-tertiary": "#123243",
    "--dsw-alias-toast-bg": "#104f60",
    "--dsw-specific-input-major": "#0d4858",
    "--dsw-specific-login-input": "#05303c",
    "--dsw-specific-menu": "#0d4858",
    "--dsw-specific-selector": "#073642",
    "--dsw-specific-sidebar-nav-item-hover": "#073642",
    "--dsw-specific-tip": "#073642",
  }),
});
```

- [ ] **Step 2: Register in the catalog.** In `packages/core/src/themes/index.ts`: add `import { solarized } from "./solarized.ts";` immediately after the `import { oled } ...` line (imports stay alphabetical; after all five tasks the order is catppuccin, cobalt2, deepseek, dracula, gruvbox, nord, oled, solarized, synthwave-84, tokyo-night). Add `solarized,` after `githubDark,` in the `themes` array, and extend the re-export line. Resulting re-export after this task:
      `export { catppuccin, deepseek, dracula, githubDark, oled, solarized, tokyoNight };`
      Array tail after this task: `  tokyoNight,\n  githubDark,\n  solarized,\n]);`

- [ ] **Step 3: Add picker copy.** In `packages/ui/src/locales.ts`: extend the `PickerKey` union — change `| "theme.github-dark";` to `| "theme.github-dark"\n  | "theme.solarized";`. Add to `en`: `"theme.solarized": "Solarized",` after the github-dark line. Add to `zh`: `"theme.solarized": "Solarized",` after its github-dark line.

- [ ] **Step 4: Run tests — expect exactly one red area (missing preview)**

Run: `pnpm test`
Expected: `previews.spec.ts` fails with `previews/solarized.svg is missing — run pnpm previews`; `themes.spec.ts`, `contrast.spec.ts`, and `locales.spec.ts` pass (70-token coverage, id uniqueness, contrast bars, picker copy).

- [ ] **Step 5: Generate the preview and go green**

Run: `pnpm previews && pnpm test`
Expected: `previews/solarized.svg` written; full suite passes.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/themes/solarized.ts packages/core/src/themes/index.ts packages/ui/src/locales.ts previews/solarized.svg
git commit -m "feat: add solarized theme"
```

---

### Task 3: gruvbox theme

**Files:**

- Create: `packages/core/src/themes/gruvbox.ts`
- Modify: `packages/core/src/themes/index.ts`, `packages/ui/src/locales.ts`
- Generated: `previews/gruvbox.svg`

**Interfaces:**

- Produces: `export const gruvbox: ThemeDefinition`, `id: "gruvbox"`; 8th catalog entry; `PickerKey` gains `"theme.gruvbox"`.

- [ ] **Step 1: Create the theme file** (zero contrast substitutions — every value is upstream gruvbox)

```ts
import type { ThemeDefinition } from "../types.ts";

/**
 * Gruvbox Dark: retro groove palette — neutral bg0 surfaces, warm orange
 * accent, bright fg text. Every value is from the upstream palette; the
 * ladder is bg0 → bg0_soft → bg1 → bg2 → bg3, with bg0_hard as the darkest
 * surface for code blocks and the sidebar.
 */
export const gruvbox: ThemeDefinition = Object.freeze({
  id: "gruvbox",
  colorScheme: "dark",
  tokens: Object.freeze({
    "--dsw-alias-bg-base": "#282828",
    "--dsw-alias-bg-layer-1": "#32302f",
    "--dsw-alias-bg-layer-2": "#3c3836",
    "--dsw-alias-bg-layer-3": "#504945",
    "--dsw-alias-bg-overlay": "#665c54",
    "--dsw-alias-label-primary": "#ebdbb2",
    "--dsw-alias-label-secondary": "#d5c4a1",
    "--dsw-alias-label-tertiary": "#a89984",
    "--dsw-alias-brand-primary": "#fe8019",
    "--dsw-alias-state-business-primary": "#83a598",
    "--dsw-alias-state-success-primary": "#b8bb26",
    "--dsw-alias-state-warn-primary": "#fabd2f",
    "--dsw-alias-state-error-primary": "#fb4934",
    "--dsw-alias-border-l1": "rgba(235, 219, 178, 0.08)",
    "--dsw-alias-border-l2": "rgba(235, 219, 178, 0.15)",
    "--dsw-alias-interactive-bg-hover": "rgba(235, 219, 178, 0.06)",
    "--dsw-alias-interactive-bg-active": "rgba(235, 219, 178, 0.12)",
    "--dsw-alias-button-primary-fill": "#fe8019",
    "--dsw-alias-button-primary-hover": "#fe9440",
    "--dsw-alias-markdown-code-block": "#1d2021",
    "--dsw-alias-markdown-code-block-banner": "#1d2021",
    "--dsw-alias-markdown-inline-code": "#3c3836",
    "--dsw-alias-markdown-tag": "#3c3836",
    "--dsw-alias-scrollbar-bg-l1": "#665c54",
    "--dsw-alias-scrollbar-hover-l1": "#7c6f64",
    "--dsw-alias-tooltip-bg": "#665c54",
    "--dsw-specific-bubble": "#3c3836",
    "--dsw-specific-bubble-highlight": "#504945",
    "--dsw-specific-sidebar-fill": "#1d2021",
    "--dsw-specific-sidebar-nav-item-active": "#3c3836",
    "--dsw-alias-bg-mask-1": "rgba(0, 0, 0, 0.5)",
    "--dsw-alias-bg-mask-2": "rgba(0, 0, 0, 0.2)",
    "--dsw-alias-bg-mask-3": "rgba(0, 0, 0, 0.48)",
    "--dsw-alias-bg-module-platform": "#3c3836",
    "--dsw-alias-bg-multi-select": "#32302f",
    "--dsw-alias-bg-skeleton": "rgba(235, 219, 178, 0.08)",
    "--dsw-alias-border-l3": "rgba(235, 219, 178, 0.22)",
    "--dsw-alias-border-l4": "rgba(235, 219, 178, 0.28)",
    "--dsw-alias-border-inverted": "rgba(235, 219, 178, 0.1)",
    "--dsw-alias-button-info-fill": "#83a598",
    "--dsw-alias-button-info-hover": "#9db3ab",
    "--dsw-alias-button-elevated-fill": "#32302f",
    "--dsw-alias-button-floating-fill": "#3c3836",
    "--dsw-alias-button-floating-hover": "#504945",
    "--dsw-alias-interactive-bg-hover-solid": "#504945",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(251, 73, 52, 0.18)",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(254, 128, 25, 0.24)",
    "--dsw-alias-label-caption": "#a89984",
    "--dsw-alias-label-primary-inverted": "#282828",
    "--dsw-alias-label-primary-dimmed": "#d5c4a1",
    "--dsw-alias-label-dimmed": "#504945",
    "--dsw-alias-markdown-citation": "#3c3836",
    "--dsw-alias-markdown-code-segment-selected": "#504945",
    "--dsw-alias-markdown-code-segment-unselected": "#1d2021",
    "--dsw-alias-markdown-placeholder": "#3c3836",
    "--dsw-alias-scrollbar-bg-l2": "#665c54",
    "--dsw-alias-scrollbar-hover-l2": "#7c6f64",
    "--dsw-alias-state-success-secondary": "#c9cc5c",
    "--dsw-alias-state-warn-secondary": "#fbca62",
    "--dsw-alias-state-error-secondary": "#fb6b5a",
    "--dsw-alias-state-success-tertiary": "#2c3021",
    "--dsw-alias-state-warn-tertiary": "#3f3520",
    "--dsw-alias-state-business-tertiary": "#26343a",
    "--dsw-alias-toast-bg": "#665c54",
    "--dsw-specific-input-major": "#504945",
    "--dsw-specific-login-input": "#1d2021",
    "--dsw-specific-menu": "#504945",
    "--dsw-specific-selector": "#3c3836",
    "--dsw-specific-sidebar-nav-item-hover": "#3c3836",
    "--dsw-specific-tip": "#3c3836",
  }),
});
```

- [ ] **Step 2: Register.** `index.ts`: add `import { gruvbox } from "./gruvbox.ts";` after the githubDark import. Add `gruvbox,` after `solarized,` in the array; extend the re-export.

- [ ] **Step 3: Picker copy.** `locales.ts`: union gains `| "theme.gruvbox"` after `"theme.solarized"`; `en` and `zh` each gain `"theme.gruvbox": "Gruvbox",`.

- [ ] **Step 4: Red.** Run `pnpm test` → only `previews/gruvbox.svg is missing` fails.

- [ ] **Step 5: Green.** Run `pnpm previews && pnpm test` → all pass.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/themes/gruvbox.ts packages/core/src/themes/index.ts packages/ui/src/locales.ts previews/gruvbox.svg
git commit -m "feat: add gruvbox theme"
```

---

### Task 4: nord theme

**Files:**

- Create: `packages/core/src/themes/nord.ts`
- Modify: `packages/core/src/themes/index.ts`, `packages/ui/src/locales.ts`
- Generated: `previews/nord.svg`

**Interfaces:**

- Produces: `export const nord: ThemeDefinition`, `id: "nord"`; 9th catalog entry; `PickerKey` gains `"theme.nord"`.

- [ ] **Step 1: Create the theme file**

```ts
import type { ThemeDefinition } from "../types.ts";

/**
 * Nord: arctic north-blues — nord0 surfaces, frost nord8 accent, aurora
 * state colors.
 *
 * Tertiary/caption take frost nord9 `#81a1c1`: nord3 `#4c566a` reaches only
 * ~2:1 on the nord0–nord2 ladder, so nord3 is confined to layer-3/overlay/
 * scrollbar tracks and never sits under text. Borders and interactions use
 * translucent nord6 overlays. Upstream paints code blocks and the sidebar
 * the same nord0 as the base; depth comes from nord1/nord2 raised surfaces.
 * Scrollbar hover `#5e6b82` is nord3 lightened.
 */
export const nord: ThemeDefinition = Object.freeze({
  id: "nord",
  colorScheme: "dark",
  tokens: Object.freeze({
    "--dsw-alias-bg-base": "#2e3440",
    "--dsw-alias-bg-layer-1": "#3b4252",
    "--dsw-alias-bg-layer-2": "#434c5e",
    "--dsw-alias-bg-layer-3": "#4c566a",
    "--dsw-alias-bg-overlay": "#4c566a",
    "--dsw-alias-label-primary": "#eceff4",
    "--dsw-alias-label-secondary": "#d8dee9",
    "--dsw-alias-label-tertiary": "#81a1c1",
    "--dsw-alias-brand-primary": "#88c0d0",
    "--dsw-alias-state-business-primary": "#5e81ac",
    "--dsw-alias-state-success-primary": "#a3be8c",
    "--dsw-alias-state-warn-primary": "#ebcb8b",
    "--dsw-alias-state-error-primary": "#bf616a",
    "--dsw-alias-border-l1": "rgba(236, 239, 244, 0.08)",
    "--dsw-alias-border-l2": "rgba(236, 239, 244, 0.15)",
    "--dsw-alias-interactive-bg-hover": "rgba(236, 239, 244, 0.06)",
    "--dsw-alias-interactive-bg-active": "rgba(236, 239, 244, 0.12)",
    "--dsw-alias-button-primary-fill": "#88c0d0",
    "--dsw-alias-button-primary-hover": "#9ccdda",
    "--dsw-alias-markdown-code-block": "#2e3440",
    "--dsw-alias-markdown-code-block-banner": "#3b4252",
    "--dsw-alias-markdown-inline-code": "#3b4252",
    "--dsw-alias-markdown-tag": "#3b4252",
    "--dsw-alias-scrollbar-bg-l1": "#4c566a",
    "--dsw-alias-scrollbar-hover-l1": "#5e6b82",
    "--dsw-alias-tooltip-bg": "#434c5e",
    "--dsw-specific-bubble": "#3b4252",
    "--dsw-specific-bubble-highlight": "#434c5e",
    "--dsw-specific-sidebar-fill": "#2e3440",
    "--dsw-specific-sidebar-nav-item-active": "#3b4252",
    "--dsw-alias-bg-mask-1": "rgba(0, 0, 0, 0.5)",
    "--dsw-alias-bg-mask-2": "rgba(0, 0, 0, 0.2)",
    "--dsw-alias-bg-mask-3": "rgba(0, 0, 0, 0.48)",
    "--dsw-alias-bg-module-platform": "#3b4252",
    "--dsw-alias-bg-multi-select": "#3b4252",
    "--dsw-alias-bg-skeleton": "rgba(236, 239, 244, 0.08)",
    "--dsw-alias-border-l3": "rgba(236, 239, 244, 0.22)",
    "--dsw-alias-border-l4": "rgba(236, 239, 244, 0.28)",
    "--dsw-alias-border-inverted": "rgba(236, 239, 244, 0.1)",
    "--dsw-alias-button-info-fill": "#5e81ac",
    "--dsw-alias-button-info-hover": "#7391b9",
    "--dsw-alias-button-elevated-fill": "#3b4252",
    "--dsw-alias-button-floating-fill": "#3b4252",
    "--dsw-alias-button-floating-hover": "#434c5e",
    "--dsw-alias-interactive-bg-hover-solid": "#434c5e",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(191, 97, 106, 0.18)",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(136, 192, 208, 0.24)",
    "--dsw-alias-label-caption": "#81a1c1",
    "--dsw-alias-label-primary-inverted": "#2e3440",
    "--dsw-alias-label-primary-dimmed": "#d8dee9",
    "--dsw-alias-label-dimmed": "#434c5e",
    "--dsw-alias-markdown-citation": "#3b4252",
    "--dsw-alias-markdown-code-segment-selected": "#434c5e",
    "--dsw-alias-markdown-code-segment-unselected": "#2e3440",
    "--dsw-alias-markdown-placeholder": "#3b4252",
    "--dsw-alias-scrollbar-bg-l2": "#4c566a",
    "--dsw-alias-scrollbar-hover-l2": "#5e6b82",
    "--dsw-alias-state-success-secondary": "#b7d0a5",
    "--dsw-alias-state-warn-secondary": "#f2dcae",
    "--dsw-alias-state-error-secondary": "#d47f87",
    "--dsw-alias-state-success-tertiary": "#2f3b33",
    "--dsw-alias-state-warn-tertiary": "#3f3a2e",
    "--dsw-alias-state-business-tertiary": "#2c3a4a",
    "--dsw-alias-toast-bg": "#434c5e",
    "--dsw-specific-input-major": "#434c5e",
    "--dsw-specific-login-input": "#2e3440",
    "--dsw-specific-menu": "#434c5e",
    "--dsw-specific-selector": "#3b4252",
    "--dsw-specific-sidebar-nav-item-hover": "#3b4252",
    "--dsw-specific-tip": "#3b4252",
  }),
});
```

- [ ] **Step 2: Register.** `index.ts`: add `import { nord } from "./nord.ts";` after the gruvbox import. Add `nord,` after `gruvbox,` in the array; extend the re-export.

- [ ] **Step 3: Picker copy.** `locales.ts`: union gains `| "theme.nord"`; `en`/`zh` each gain `"theme.nord": "Nord",`.

- [ ] **Step 4: Red.** `pnpm test` → only `previews/nord.svg is missing`.

- [ ] **Step 5: Green.** `pnpm previews && pnpm test` → all pass.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/themes/nord.ts packages/core/src/themes/index.ts packages/ui/src/locales.ts previews/nord.svg
git commit -m "feat: add nord theme"
```

---

### Task 5: synthwave-84 theme

**Files:**

- Create: `packages/core/src/themes/synthwave-84.ts`
- Modify: `packages/core/src/themes/index.ts`, `packages/ui/src/locales.ts`
- Generated: `previews/synthwave-84.svg`

**Interfaces:**

- Produces: `export const synthwave84: ThemeDefinition`, `id: "synthwave-84"`; 10th catalog entry; `PickerKey` gains `"theme.synthwave-84"`.

- [ ] **Step 1: Create the theme file** (all surfaces/accent values are upstream workbench or token colors from robb0wen/synthwave-vscode)

```ts
import type { ThemeDefinition } from "../types.ts";

/**
 * Synthwave '84: neon pink and cyan over a deep violet night — robb0wen's
 * retro-futurescape. Surfaces are the upstream workbench backgrounds
 * (`#241b2f`, `#262335`, `#2a2139`, `#34294f`, `#463465`, `#232530`,
 * `#171520`); text is upstream white/gray/comment; accents are the neon
 * token colors. Button hover variants are lightened. No contrast
 * substitutions were needed.
 */
export const synthwave84: ThemeDefinition = Object.freeze({
  id: "synthwave-84",
  colorScheme: "dark",
  tokens: Object.freeze({
    "--dsw-alias-bg-base": "#241b2f",
    "--dsw-alias-bg-layer-1": "#262335",
    "--dsw-alias-bg-layer-2": "#2a2139",
    "--dsw-alias-bg-layer-3": "#34294f",
    "--dsw-alias-bg-overlay": "#463465",
    "--dsw-alias-label-primary": "#ffffff",
    "--dsw-alias-label-secondary": "#b6b1b1",
    "--dsw-alias-label-tertiary": "#848bbd",
    "--dsw-alias-brand-primary": "#ff7edb",
    "--dsw-alias-state-business-primary": "#36f9f6",
    "--dsw-alias-state-success-primary": "#72f1b8",
    "--dsw-alias-state-warn-primary": "#fede5d",
    "--dsw-alias-state-error-primary": "#fe4450",
    "--dsw-alias-border-l1": "rgba(255, 255, 255, 0.08)",
    "--dsw-alias-border-l2": "rgba(255, 255, 255, 0.15)",
    "--dsw-alias-interactive-bg-hover": "rgba(255, 255, 255, 0.06)",
    "--dsw-alias-interactive-bg-active": "rgba(255, 255, 255, 0.12)",
    "--dsw-alias-button-primary-fill": "#ff7edb",
    "--dsw-alias-button-primary-hover": "#ff98e3",
    "--dsw-alias-markdown-code-block": "#232530",
    "--dsw-alias-markdown-code-block-banner": "#232530",
    "--dsw-alias-markdown-inline-code": "#2a2139",
    "--dsw-alias-markdown-tag": "#2a2139",
    "--dsw-alias-scrollbar-bg-l1": "#463465",
    "--dsw-alias-scrollbar-hover-l1": "#495495",
    "--dsw-alias-tooltip-bg": "#34294f",
    "--dsw-specific-bubble": "#2a2139",
    "--dsw-specific-bubble-highlight": "#34294f",
    "--dsw-specific-sidebar-fill": "#171520",
    "--dsw-specific-sidebar-nav-item-active": "#2a2139",
    "--dsw-alias-bg-mask-1": "rgba(0, 0, 0, 0.5)",
    "--dsw-alias-bg-mask-2": "rgba(0, 0, 0, 0.2)",
    "--dsw-alias-bg-mask-3": "rgba(0, 0, 0, 0.48)",
    "--dsw-alias-bg-module-platform": "#2a2139",
    "--dsw-alias-bg-multi-select": "#262335",
    "--dsw-alias-bg-skeleton": "rgba(255, 255, 255, 0.08)",
    "--dsw-alias-border-l3": "rgba(255, 255, 255, 0.22)",
    "--dsw-alias-border-l4": "rgba(255, 255, 255, 0.28)",
    "--dsw-alias-border-inverted": "rgba(255, 255, 255, 0.1)",
    "--dsw-alias-button-info-fill": "#36f9f6",
    "--dsw-alias-button-info-hover": "#5ffbf8",
    "--dsw-alias-button-elevated-fill": "#262335",
    "--dsw-alias-button-floating-fill": "#2a2139",
    "--dsw-alias-button-floating-hover": "#34294f",
    "--dsw-alias-interactive-bg-hover-solid": "#34294f",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(254, 68, 80, 0.18)",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(255, 126, 219, 0.24)",
    "--dsw-alias-label-caption": "#848bbd",
    "--dsw-alias-label-primary-inverted": "#241b2f",
    "--dsw-alias-label-primary-dimmed": "#b6b1b1",
    "--dsw-alias-label-dimmed": "#34294f",
    "--dsw-alias-markdown-citation": "#2a2139",
    "--dsw-alias-markdown-code-segment-selected": "#34294f",
    "--dsw-alias-markdown-code-segment-unselected": "#171520",
    "--dsw-alias-markdown-placeholder": "#2a2139",
    "--dsw-alias-scrollbar-bg-l2": "#463465",
    "--dsw-alias-scrollbar-hover-l2": "#495495",
    "--dsw-alias-state-success-secondary": "#97f5cb",
    "--dsw-alias-state-warn-secondary": "#fee97e",
    "--dsw-alias-state-error-secondary": "#fe7580",
    "--dsw-alias-state-success-tertiary": "#1d3a2f",
    "--dsw-alias-state-warn-tertiary": "#3d3620",
    "--dsw-alias-state-business-tertiary": "#1e3a46",
    "--dsw-alias-toast-bg": "#34294f",
    "--dsw-specific-input-major": "#34294f",
    "--dsw-specific-login-input": "#171520",
    "--dsw-specific-menu": "#34294f",
    "--dsw-specific-selector": "#2a2139",
    "--dsw-specific-sidebar-nav-item-hover": "#2a2139",
    "--dsw-specific-tip": "#2a2139",
  }),
});
```

- [ ] **Step 2: Register.** `index.ts`: add `import { synthwave84 } from "./synthwave-84.ts";` after the solarized import. Add `synthwave84,` after `nord,` in the array; extend the re-export.

- [ ] **Step 3: Picker copy.** `locales.ts`: union gains `| "theme.synthwave-84"`; `en`/`zh` each gain `"theme.synthwave-84": "Synthwave '84",`.

- [ ] **Step 4: Red.** `pnpm test` → only `previews/synthwave-84.svg is missing`.

- [ ] **Step 5: Green.** `pnpm previews && pnpm test` → all pass.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/themes/synthwave-84.ts packages/core/src/themes/index.ts packages/ui/src/locales.ts previews/synthwave-84.svg
git commit -m "feat: add synthwave-84 theme"
```

---

### Task 6: cobalt2 theme

**Files:**

- Create: `packages/core/src/themes/cobalt2.ts`
- Modify: `packages/core/src/themes/index.ts`, `packages/ui/src/locales.ts`
- Generated: `previews/cobalt2.svg`

**Interfaces:**

- Produces: `export const cobalt2: ThemeDefinition`, `id: "cobalt2"`; 11th (final) catalog entry; `PickerKey` gains `"theme.cobalt2"`. After this task the `PickerKey` union's theme tail reads: `"theme.solarized" | "theme.gruvbox" | "theme.nord" | "theme.synthwave-84" | "theme.cobalt2";`

- [ ] **Step 1: Create the theme file** (surfaces are upstream workbench colors from wesbos/cobalt2-vscode)

```ts
import type { ThemeDefinition } from "../types.ts";

/**
 * Cobalt2: Wes Bos's cobalt blue with the signature yellow — editor
 * `#193549` base, line-highlight/indent-guide ladder, terminal/panel darks.
 * Business blue `#0088ff` holds 3.7:1 on the base, above the 3:1 accent bar;
 * text colors are upstream white/`#e1efff`/`#ccc`/`#aaa`. Button hover
 * variants are lightened.
 */
export const cobalt2: ThemeDefinition = Object.freeze({
  id: "cobalt2",
  colorScheme: "dark",
  tokens: Object.freeze({
    "--dsw-alias-bg-base": "#193549",
    "--dsw-alias-bg-layer-1": "#1f4662",
    "--dsw-alias-bg-layer-2": "#3b5364",
    "--dsw-alias-bg-layer-3": "#406179",
    "--dsw-alias-bg-overlay": "#406179",
    "--dsw-alias-label-primary": "#ffffff",
    "--dsw-alias-label-secondary": "#e1efff",
    "--dsw-alias-label-tertiary": "#cccccc",
    "--dsw-alias-brand-primary": "#ffc600",
    "--dsw-alias-state-business-primary": "#0088ff",
    "--dsw-alias-state-success-primary": "#3ad900",
    "--dsw-alias-state-warn-primary": "#ff9d00",
    "--dsw-alias-state-error-primary": "#ff628c",
    "--dsw-alias-border-l1": "rgba(255, 255, 255, 0.08)",
    "--dsw-alias-border-l2": "rgba(255, 255, 255, 0.15)",
    "--dsw-alias-interactive-bg-hover": "rgba(255, 255, 255, 0.06)",
    "--dsw-alias-interactive-bg-active": "rgba(255, 255, 255, 0.12)",
    "--dsw-alias-button-primary-fill": "#ffc600",
    "--dsw-alias-button-primary-hover": "#ffd133",
    "--dsw-alias-markdown-code-block": "#122738",
    "--dsw-alias-markdown-code-block-banner": "#122738",
    "--dsw-alias-markdown-inline-code": "#1f4662",
    "--dsw-alias-markdown-tag": "#1f4662",
    "--dsw-alias-scrollbar-bg-l1": "#406179",
    "--dsw-alias-scrollbar-hover-l1": "#5b7d97",
    "--dsw-alias-tooltip-bg": "#1f4662",
    "--dsw-specific-bubble": "#1f4662",
    "--dsw-specific-bubble-highlight": "#3b5364",
    "--dsw-specific-sidebar-fill": "#15232d",
    "--dsw-specific-sidebar-nav-item-active": "#1f4662",
    "--dsw-alias-bg-mask-1": "rgba(0, 0, 0, 0.5)",
    "--dsw-alias-bg-mask-2": "rgba(0, 0, 0, 0.2)",
    "--dsw-alias-bg-mask-3": "rgba(0, 0, 0, 0.48)",
    "--dsw-alias-bg-module-platform": "#1f4662",
    "--dsw-alias-bg-multi-select": "#1f4662",
    "--dsw-alias-bg-skeleton": "rgba(255, 255, 255, 0.08)",
    "--dsw-alias-border-l3": "rgba(255, 255, 255, 0.22)",
    "--dsw-alias-border-l4": "rgba(255, 255, 255, 0.28)",
    "--dsw-alias-border-inverted": "rgba(255, 255, 255, 0.1)",
    "--dsw-alias-button-info-fill": "#0088ff",
    "--dsw-alias-button-info-hover": "#33a1ff",
    "--dsw-alias-button-elevated-fill": "#1f4662",
    "--dsw-alias-button-floating-fill": "#1f4662",
    "--dsw-alias-button-floating-hover": "#3b5364",
    "--dsw-alias-interactive-bg-hover-solid": "#3b5364",
    "--dsw-alias-interactive-bg-hover-danger": "rgba(255, 98, 140, 0.18)",
    "--dsw-alias-interactive-bg-hover-accent": "rgba(255, 198, 0, 0.24)",
    "--dsw-alias-label-caption": "#aaaaaa",
    "--dsw-alias-label-primary-inverted": "#193549",
    "--dsw-alias-label-primary-dimmed": "#e1efff",
    "--dsw-alias-label-dimmed": "#3b5364",
    "--dsw-alias-markdown-citation": "#1f4662",
    "--dsw-alias-markdown-code-segment-selected": "#3b5364",
    "--dsw-alias-markdown-code-segment-unselected": "#122738",
    "--dsw-alias-markdown-placeholder": "#1f4662",
    "--dsw-alias-scrollbar-bg-l2": "#406179",
    "--dsw-alias-scrollbar-hover-l2": "#5b7d97",
    "--dsw-alias-state-success-secondary": "#64e83b",
    "--dsw-alias-state-warn-secondary": "#ffb13d",
    "--dsw-alias-state-error-secondary": "#ff84a5",
    "--dsw-alias-state-success-tertiary": "#1d3a26",
    "--dsw-alias-state-warn-tertiary": "#3d2f16",
    "--dsw-alias-state-business-tertiary": "#123449",
    "--dsw-alias-toast-bg": "#1f4662",
    "--dsw-specific-input-major": "#3b5364",
    "--dsw-specific-login-input": "#122738",
    "--dsw-specific-menu": "#3b5364",
    "--dsw-specific-selector": "#1f4662",
    "--dsw-specific-sidebar-nav-item-hover": "#1f4662",
    "--dsw-specific-tip": "#1f4662",
  }),
});
```

- [ ] **Step 2: Register.** `index.ts`: add `import { cobalt2 } from "./cobalt2.ts";` after the catppuccin import (alphabetical first among the new files). Add `cobalt2,` after `synthwave84,` in the array; extend the re-export. Final re-export:
      `export { catppuccin, cobalt2, deepseek, dracula, githubDark, gruvbox, nord, oled, solarized, synthwave84, tokyoNight };`

- [ ] **Step 3: Picker copy.** `locales.ts`: union gains `| "theme.cobalt2"`; `en`/`zh` each gain `"theme.cobalt2": "Cobalt2",`.

- [ ] **Step 4: Red.** `pnpm test` → only `previews/cobalt2.svg is missing`.

- [ ] **Step 5: Green.** `pnpm previews && pnpm test` → all pass (11 themes).

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/themes/cobalt2.ts packages/core/src/themes/index.ts packages/ui/src/locales.ts previews/cobalt2.svg
git commit -m "feat: add cobalt2 theme"
```

---

### Task 7: Live captures and gallery/docs wiring

**Main-session task** — needs the running harness web pair and browser screenshot tooling; do not dispatch to a code-only subagent.

**Files:**

- Create: `screenshots/{solarized,gruvbox,nord,synthwave-84,cobalt2}.png`
- Modify: `README.md`, `README.zh.md`, `docs/previews.md`, `docs/previews.zh.md`

**Interfaces:**

- Consumes: the 11-theme catalog from Tasks 2–6; `previews.spec.ts` enforces that every capture exists and is referenced by both galleries, and that each gallery quotes each theme's two identity colors and preview path.

- [ ] **Step 1: Capture each mounted theme.** Build and mount the local pair per the local-install section of `docs/installation.md` (`pnpm build`, then `dsh plugin --profile web add <local path>` if the profile does not already point at the workspace build, then `dsh web`). In the browser, open Settings → General → Theme, select each new theme, and capture the harness viewport to `screenshots/<id>.png` (match the pixel dimensions of `screenshots/deepseek.png`; check with `sips -g pixelWidth -g pixelHeight screenshots/deepseek.png`).

- [ ] **Step 2: Wire README tables.** Append after the GitHub Dark row in `README.md`:

```markdown
| Solarized | dark — scientific teal, yellow accent | <img src="previews/solarized.svg" alt="Solarized theme preview" width="220"> |
| Gruvbox | dark — retro warm palette, orange | <img src="previews/gruvbox.svg" alt="Gruvbox theme preview" width="220"> |
| Nord | dark — arctic north-blues, frost | <img src="previews/nord.svg" alt="Nord theme preview" width="220"> |
| Synthwave '84 | dark — neon pink/cyan on deep violet | <img src="previews/synthwave-84.svg" alt="Synthwave '84 theme preview" width="220"> |
| Cobalt2 | dark — cobalt blue, signature yellow | <img src="previews/cobalt2.svg" alt="Cobalt2 theme preview" width="220"> |
```

In `README.zh.md` (same position):

```markdown
| Solarized | 深色——科学配色的青绿底 + 黄色点缀 | <img src="previews/solarized.svg" alt="Solarized 主题预览" width="220"> |
| Gruvbox | 深色——复古暖色调 + 橙色点缀 | <img src="previews/gruvbox.svg" alt="Gruvbox 主题预览" width="220"> |
| Nord | 深色——北极冰蓝 + 霜蓝点缀 | <img src="previews/nord.svg" alt="Nord 主题预览" width="220"> |
| Synthwave '84 | 深色——深紫底上的霓虹粉与青 | <img src="previews/synthwave-84.svg" alt="Synthwave '84 主题预览" width="220"> |
| Cobalt2 | 深色——钴蓝底 + 标志性黄色 | <img src="previews/cobalt2.svg" alt="Cobalt2 主题预览" width="220"> |
```

(Prettier reformats table padding on commit; content is what matters.)

- [ ] **Step 3: Gallery sections.** In `docs/previews.md`, insert before `## Adding one`:

```markdown
## Solarized

Dark — Solarized Dark's scientific palette: teal base03 surfaces, solarized yellow accent. Base `#002b36`, brand `#b58900`.

![Solarized theme preview](../previews/solarized.svg)

![Solarized applied in the harness](../screenshots/solarized.png)

## Gruvbox

Dark — Gruvbox Dark's retro groove: warm neutral surfaces, bright orange accent. Base `#282828`, brand `#fe8019`.

![Gruvbox theme preview](../previews/gruvbox.svg)

![Gruvbox applied in the harness](../screenshots/gruvbox.png)

## Nord

Dark — Nord's arctic north-blues with frost accents. Base `#2e3440`, brand `#88c0d0`.

![Nord theme preview](../previews/nord.svg)

![Nord applied in the harness](../screenshots/nord.png)

## Synthwave '84

Dark — neon pink and cyan over a deep violet night. Base `#241b2f`, brand `#ff7edb`.

![Synthwave '84 theme preview](../previews/synthwave-84.svg)

![Synthwave '84 applied in the harness](../screenshots/synthwave-84.png)

## Cobalt2

Dark — cobalt blue with Wes Bos's signature yellow. Base `#193549`, brand `#ffc600`.

![Cobalt2 theme preview](../previews/cobalt2.svg)

![Cobalt2 applied in the harness](../screenshots/cobalt2.png)
```

In `docs/previews.zh.md` (same position, matching the existing section style):

```markdown
## Solarized

深色——Solarized Dark 科学配色：青绿底 + 黄色点缀。底色 `#002b36`，主色 `#b58900`。

![Solarized 主题预览](../previews/solarized.svg)

![Solarized 在 harness 中的实际效果](../screenshots/solarized.png)

## Gruvbox

深色——Gruvbox 复古暖色调 + 橙色点缀。底色 `#282828`，主色 `#fe8019`。

![Gruvbox 主题预览](../previews/gruvbox.svg)

![Gruvbox 在 harness 中的实际效果](../screenshots/gruvbox.png)

## Nord

深色——Nord 北极冰蓝 + 霜蓝点缀。底色 `#2e3440`，主色 `#88c0d0`。

![Nord 主题预览](../previews/nord.svg)

![Nord 在 harness 中的实际效果](../screenshots/nord.png)

## Synthwave '84

深色——深紫底上的霓虹粉与青。底色 `#241b2f`，主色 `#ff7edb`。

![Synthwave '84 主题预览](../previews/synthwave-84.svg)

![Synthwave '84 在 harness 中的实际效果](../screenshots/synthwave-84.png)

## Cobalt2

深色——钴蓝底 + 标志性黄色。底色 `#193549`，主色 `#ffc600`。

![Cobalt2 主题预览](../previews/cobalt2.svg)

![Cobalt2 在 harness 中的实际效果](../screenshots/cobalt2.png)
```

- [ ] **Step 4: Verify.** `pnpm test` → previews gallery checks pass (identity hexes, preview paths, capture references all present).

- [ ] **Step 5: Commit**

```bash
git add screenshots/ README.md README.zh.md docs/previews.md docs/previews.zh.md
git commit -m "docs: wire the five new themes into galleries with live captures"
```

---

### Task 8: Changeset and full gate

**Files:**

- Create: `.changeset/theme-catalog-expansion.md`

**Interfaces:**

- Consumes: everything above. Produces: a releasable branch (minor bump, both packages are version-fixed together per `.changeset/config.json`).

- [ ] **Step 1: Write the changeset**

```markdown
---
"@dshthemes/core": minor
"@dshthemes/ui": minor
---

Adds five themes to the catalog: Solarized, Gruvbox, Nord, Synthwave '84, and
Cobalt2. The picker now offers 11 themes spanning 7 base-hue families.
```

- [ ] **Step 2: Format and run the full gate**

```bash
pnpm fmt
pnpm test && pnpm typecheck && pnpm test:coverage && pnpm lint && pnpm build
```

Expected: all green; coverage stays per-file 100% (theme files are data-only); build emits declarations for both packages.

- [ ] **Step 3: Commit**

```bash
git add .changeset/theme-catalog-expansion.md
git commit -m "chore: changeset for theme catalog expansion"
```

- [ ] **Step 4: Sanity check the branch**

```bash
git log --oneline main..HEAD
git status --short
```

Expected: 8 commits ahead of main (spec commits precede these), clean tree.
