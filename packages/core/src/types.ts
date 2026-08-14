/**
 * Type contract for deepseek-harness themes.
 *
 * These declarations mirror the published theme extension point of
 * `@deepseek-ai/dsh-client-ui-theme@0.0.1-rc.1`
 * (packages/client/ui-theme/src/client/index.ts): `ThemeTokens`,
 * `ThemeDefinition`, `ThemeSnapshot`, and the `register`/`setTheme` surface of
 * its ThemeService. This package keeps the contract self-contained so that it
 * type-checks and tests without depending on the dsh application tree at
 * build time; at runtime the host's ThemeService satisfies `ThemeRegistry`
 * structurally.
 */

/** Theme token dictionary: `--dsw-alias-*` overrides keyed by variable name. */
export type ThemeTokens = Record<string, string>;

/**
 * One selectable theme.
 *
 * @property id - Theme id (the `setTheme` argument for concrete themes);
 *   reserved ids are `light`, `dark`, and `system` (a preference, not a theme).
 * @property colorScheme - Which base palette this theme builds on. The
 *   presenter switches `body[data-ds-dark-theme]` from this field — never
 *   from the id.
 * @property tokens - Alias-layer overrides applied as inline CSS variables
 *   over the base palette.
 */
export interface ThemeDefinition {
  id: string;
  colorScheme: "light" | "dark";
  tokens: ThemeTokens;
}

/**
 * The registration surface this package consumes. The host's ThemeService
 * (`ctx.theme`) satisfies this interface structurally.
 */
export interface ThemeRegistry {
  /**
   * Register a theme. Duplicate id throws; `system` is not registrable.
   * @returns disposer that unregisters the theme (and resets the preference
   *   when the disposed theme was active).
   */
  register(definition: ThemeDefinition): () => void;
}
