# Creating a Theme

A theme is one frozen `ThemeDefinition` file plus a catalog entry. Follow these steps and the test suite enforces the contract.

## 1. Read the spec

[`docs/theme-spec.md`](theme-spec.md) defines the token contract. Every theme must cover the full `REQUIRED_TOKENS` and `RECOMMENDED_TOKENS` sets; `pnpm test` enforces both.

## 2. Add the theme file

Create `packages/core/src/themes/<id>.ts` (kebab-case id):

```ts
import type { ThemeDefinition } from '../types.ts'

/** One-line description: palette family and mood. */
export const <name>: ThemeDefinition = Object.freeze({
  id: '<id>',
  colorScheme: 'dark', // or 'light' — the host base palette
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#101418',
    // ... the full REQUIRED_TOKENS and RECOMMENDED_TOKENS sets
  }),
})
```

Rules:

- The id is unique and never `light`, `dark`, or `system`.
- `colorScheme` names the host base palette the theme builds on; dark themes pick `'dark'` so their tokens are the dark values.
- Token values are CSS color expressions only (hex, `rgb()`/`rgba()`, `hsl()`/`hsla()`, `var()`).
- Freeze both the definition and the token dictionary.

## 3. Register the theme

Add it to `packages/core/src/themes/index.ts` (named export plus the catalog array). Catalog order is the registration order.

## 4. Add picker copy

Add the theme name to both dictionaries in `packages/ui/src/locales.ts` under `theme.<id>` (and the `PickerKey` union).

## 5. Verify

```sh
pnpm test          # id uniqueness, token coverage, color validity, freeze, contrast bars
pnpm typecheck
pnpm test:coverage # per-file 100% gate
```

Contrast failures name the token, the surface, and the ratio reached. Prefer a
lighter entry from the palette you are reproducing over inventing one; if the
palette has none, say so in the theme file's JSDoc. The bars are in
[theme-spec.md](theme-spec.md#contrast).

## 6. Preview

Run the harness web development pair with the plugin installed (see [docs/installation.md](installation.md)) and screenshot the result into `screenshots/<id>.png`.
