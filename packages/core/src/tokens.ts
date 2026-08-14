/**
 * Token contract for theme authors.
 *
 * Token names are the `--dsw-alias-*` / `--dsw-specific-*` CSS custom
 * properties declared by `@deepseek-ai/dsh-client-ui-theme`'s
 * `design-platform.css` (static scale + semantic alias layers). Themes
 * override the alias layer; the static `--dsw-static-*` scale stays owned by
 * the host stylesheets. `docs/theme-spec.md` is the human-facing twin of this
 * file — the two must stay in sync.
 */

/** Theme ids the host already owns; registering one throws. */
export const RESERVED_IDS = ["light", "dark", "system"] as const;

/**
 * Tokens every theme must provide. Missing tokens render with the host base
 * palette, so this set is enforced by `pnpm test`.
 */
export const REQUIRED_TOKENS = [
  // backgrounds
  "--dsw-alias-bg-base",
  "--dsw-alias-bg-layer-1",
  "--dsw-alias-bg-layer-2",
  "--dsw-alias-bg-layer-3",
  "--dsw-alias-bg-overlay",
  // labels
  "--dsw-alias-label-primary",
  "--dsw-alias-label-secondary",
  "--dsw-alias-label-tertiary",
  // brand and states
  "--dsw-alias-brand-primary",
  "--dsw-alias-state-business-primary",
  "--dsw-alias-state-success-primary",
  "--dsw-alias-state-warn-primary",
  "--dsw-alias-state-error-primary",
  // borders
  "--dsw-alias-border-l1",
  "--dsw-alias-border-l2",
  // interaction
  "--dsw-alias-interactive-bg-hover",
  "--dsw-alias-interactive-bg-active",
  "--dsw-alias-button-primary-fill",
  "--dsw-alias-button-primary-hover",
  // markdown and code
  "--dsw-alias-markdown-code-block",
  "--dsw-alias-markdown-code-block-banner",
  "--dsw-alias-markdown-inline-code",
  "--dsw-alias-markdown-tag",
  // scrollbars
  "--dsw-alias-scrollbar-bg-l1",
  "--dsw-alias-scrollbar-hover-l1",
  // surfaces
  "--dsw-alias-tooltip-bg",
  "--dsw-specific-bubble",
  "--dsw-specific-bubble-highlight",
  "--dsw-specific-sidebar-fill",
  "--dsw-specific-sidebar-nav-item-active",
] as const;

/**
 * Optional tokens themes may add for finer control. Every required token is
 * also listed here so a single union describes the full vocabulary.
 */
export const RECOMMENDED_TOKENS = [
  ...REQUIRED_TOKENS,
  // masks and modules
  "--dsw-alias-bg-mask-1",
  "--dsw-alias-bg-mask-2",
  "--dsw-alias-bg-mask-3",
  "--dsw-alias-bg-module-platform",
  "--dsw-alias-bg-multi-select",
  "--dsw-alias-bg-skeleton",
  // borders
  "--dsw-alias-border-l3",
  "--dsw-alias-border-l4",
  "--dsw-alias-border-inverted",
  // buttons
  "--dsw-alias-button-info-fill",
  "--dsw-alias-button-info-hover",
  "--dsw-alias-button-elevated-fill",
  "--dsw-alias-button-floating-fill",
  "--dsw-alias-button-floating-hover",
  // interaction
  "--dsw-alias-interactive-bg-hover-solid",
  "--dsw-alias-interactive-bg-hover-danger",
  "--dsw-alias-interactive-bg-hover-accent",
  // labels
  "--dsw-alias-label-caption",
  "--dsw-alias-label-primary-inverted",
  "--dsw-alias-label-primary-dimmed",
  "--dsw-alias-label-dimmed",
  // markdown
  "--dsw-alias-markdown-citation",
  "--dsw-alias-markdown-code-segment-selected",
  "--dsw-alias-markdown-code-segment-unselected",
  "--dsw-alias-markdown-placeholder",
  // scrollbars
  "--dsw-alias-scrollbar-bg-l2",
  "--dsw-alias-scrollbar-hover-l2",
  // states
  "--dsw-alias-state-success-secondary",
  "--dsw-alias-state-warn-secondary",
  "--dsw-alias-state-error-secondary",
  "--dsw-alias-state-success-tertiary",
  "--dsw-alias-state-warn-tertiary",
  "--dsw-alias-state-business-tertiary",
  // surfaces
  "--dsw-alias-toast-bg",
  "--dsw-specific-input-major",
  "--dsw-specific-login-input",
  "--dsw-specific-menu",
  "--dsw-specific-selector",
  "--dsw-specific-sidebar-nav-item-hover",
  "--dsw-specific-tip",
] as const;
