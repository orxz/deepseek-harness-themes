# Theme Spec

The token contract every theme in this repository follows. The authoritative list lives in [`packages/core/src/tokens.ts`](../packages/core/src/tokens.ts); this document is its human-facing twin and the two must stay in sync.

## How themes work

A theme is a `ThemeDefinition`:

```ts
interface ThemeDefinition {
  id: string;
  colorScheme: "light" | "dark";
  tokens: Record<string, string>;
}
```

- `id` — the theme's identity. Unique; `light`, `dark`, and `system` are reserved by the host.
- `colorScheme` — the host base palette the theme builds on. The presenter switches `body[data-ds-dark-theme]` from this field, never from the id. A dark theme declares `'dark'` and its tokens are the dark values; a light theme declares `'light'`.
- `tokens` — inline CSS variable overrides for the `--dsw-alias-*` / `--dsw-specific-*` semantic layer. Values are CSS color expressions (hex, `rgb()`/`rgba()`, `hsl()`/`hsla()`, or `var()`).

The host's `--dsw-static-*` scale is owned by the host stylesheets and is not part of this contract. Themes override the semantic layer only.

## Required tokens

Every theme must provide all of these (`REQUIRED_TOKENS` in `packages/core/src/tokens.ts`). Missing tokens fall back to the host base palette, which breaks the theme's consistency, so `pnpm test` enforces coverage.

| Group          | Tokens                                                                                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backgrounds    | `--dsw-alias-bg-base`, `--dsw-alias-bg-layer-1`, `--dsw-alias-bg-layer-2`, `--dsw-alias-bg-layer-3`, `--dsw-alias-bg-overlay`                                               |
| Labels         | `--dsw-alias-label-primary`, `--dsw-alias-label-secondary`, `--dsw-alias-label-tertiary`                                                                                    |
| Brand & states | `--dsw-alias-brand-primary`, `--dsw-alias-state-business-primary`, `--dsw-alias-state-success-primary`, `--dsw-alias-state-warn-primary`, `--dsw-alias-state-error-primary` |
| Borders        | `--dsw-alias-border-l1`, `--dsw-alias-border-l2`                                                                                                                            |
| Interaction    | `--dsw-alias-interactive-bg-hover`, `--dsw-alias-interactive-bg-active`, `--dsw-alias-button-primary-fill`, `--dsw-alias-button-primary-hover`                              |
| Code           | `--dsw-alias-markdown-code-block`, `--dsw-alias-markdown-code-block-banner`, `--dsw-alias-markdown-inline-code`, `--dsw-alias-markdown-tag`                                 |
| Scrollbars     | `--dsw-alias-scrollbar-bg-l1`, `--dsw-alias-scrollbar-hover-l1`                                                                                                             |
| Surfaces       | `--dsw-alias-tooltip-bg`, `--dsw-specific-bubble`, `--dsw-specific-bubble-highlight`, `--dsw-specific-sidebar-fill`, `--dsw-specific-sidebar-nav-item-active`               |

## Recommended tokens

`RECOMMENDED_TOKENS` extends the required set with the remaining host alias vocabulary. Shipped themes cover all of them; `pnpm test` enforces the same coverage for the recommended set.

| Group       | Tokens                                                                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Masks       | `--dsw-alias-bg-mask-1`, `--dsw-alias-bg-mask-2`, `--dsw-alias-bg-mask-3`                                                                                                                                                      |
| Modules     | `--dsw-alias-bg-module-platform`, `--dsw-alias-bg-multi-select`, `--dsw-alias-bg-skeleton`                                                                                                                                     |
| Borders     | `--dsw-alias-border-l3`, `--dsw-alias-border-l4`, `--dsw-alias-border-inverted`                                                                                                                                                |
| Buttons     | `--dsw-alias-button-info-fill`, `--dsw-alias-button-info-hover`, `--dsw-alias-button-elevated-fill`, `--dsw-alias-button-floating-fill`, `--dsw-alias-button-floating-hover`                                                   |
| Interaction | `--dsw-alias-interactive-bg-hover-solid`, `--dsw-alias-interactive-bg-hover-danger`, `--dsw-alias-interactive-bg-hover-accent`                                                                                                 |
| Labels      | `--dsw-alias-label-caption`, `--dsw-alias-label-primary-inverted`, `--dsw-alias-label-primary-dimmed`, `--dsw-alias-label-dimmed`                                                                                              |
| Markdown    | `--dsw-alias-markdown-citation`, `--dsw-alias-markdown-code-segment-selected`, `--dsw-alias-markdown-code-segment-unselected`, `--dsw-alias-markdown-placeholder`                                                              |
| Scrollbars  | `--dsw-alias-scrollbar-bg-l2`, `--dsw-alias-scrollbar-hover-l2`                                                                                                                                                                |
| States      | `--dsw-alias-state-success-secondary`, `--dsw-alias-state-warn-secondary`, `--dsw-alias-state-error-secondary`, `--dsw-alias-state-success-tertiary`, `--dsw-alias-state-warn-tertiary`, `--dsw-alias-state-business-tertiary` |
| Surfaces    | `--dsw-alias-toast-bg`, `--dsw-specific-input-major`, `--dsw-specific-login-input`, `--dsw-specific-menu`, `--dsw-specific-selector`, `--dsw-specific-sidebar-nav-item-hover`, `--dsw-specific-tip`                            |

## Semantic mapping

The theme-facing vocabulary from the project README maps to host tokens as follows:

| Concept                            | Host token(s)                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| background                         | `--dsw-alias-bg-base`                                                                                      |
| foreground                         | `--dsw-alias-label-primary`                                                                                |
| muted                              | `--dsw-alias-label-secondary`, `--dsw-alias-label-tertiary`                                                |
| primary                            | `--dsw-alias-brand-primary`                                                                                |
| accent                             | `--dsw-alias-state-business-primary`                                                                       |
| success / warning / error          | `--dsw-alias-state-success-primary` / `--dsw-alias-state-warn-primary` / `--dsw-alias-state-error-primary` |
| info                               | `--dsw-alias-state-business-primary`                                                                       |
| user / assistant / thinking / tool | `--dsw-specific-bubble` / `--dsw-specific-bubble-highlight` (the host has no per-role aliases)             |
| code                               | `--dsw-alias-markdown-code-block`, `--dsw-alias-markdown-inline-code`, `--dsw-alias-markdown-tag`          |
| diff_add / diff_delete             | `--dsw-alias-state-success-primary` / `--dsw-alias-state-error-primary` (no dedicated diff tokens)         |
| border                             | `--dsw-alias-border-l1`, `--dsw-alias-border-l2`                                                           |
| selection                          | no dedicated host alias; themes may tint `--dsw-alias-interactive-bg-active`                               |
| statusbar                          | `--dsw-specific-sidebar-fill`                                                                              |

## Completeness

The host offers no validation that an override set is complete. This repository owns completeness: `REQUIRED_TOKENS` plus the test suite (`packages/core/tests/themes.spec.ts`) that fails on missing tokens, duplicate or reserved ids, invalid color values, and non-frozen definitions.

## Persistence boundary

Third-party selection is process-local by host design. The picker plugin persists it under its own settings namespace:

```yaml
# $DSH_HOME/settings.yaml
dsh-themes:
  theme: midnight
```

The host's built-in schema (`ui-theme.preference`) only accepts `light`/`dark`/`system` and is never written by third-party ids.
