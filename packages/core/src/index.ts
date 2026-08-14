import type { ThemeDefinition, ThemeRegistry } from "./types.ts";
import { themes } from "./themes/index.ts";

export { themes };
export {
  catppuccin,
  cobalt2,
  deepseek,
  dracula,
  githubDark,
  gruvbox,
  nord,
  oled,
  solarized,
  synthwave84,
  tokyoNight,
} from "./themes/index.ts";
export type { ThemeDefinition, ThemeRegistry, ThemeTokens } from "./types.ts";
export { RECOMMENDED_TOKENS, REQUIRED_TOKENS, RESERVED_IDS } from "./tokens.ts";

/**
 * Register every shipped theme into a host theme registry (the host's
 * `ctx.theme` service satisfies {@link ThemeRegistry} structurally).
 *
 * @param registry - the theme registry that owns durable preference state.
 * @returns disposer that unregisters all themes registered by this call.
 */
export function registerThemes(registry: ThemeRegistry): () => void {
  const disposers = themes.map((theme: ThemeDefinition) =>
    registry.register(theme),
  );
  return () => {
    for (const dispose of disposers) dispose();
  };
}

/** Optional services this host entry consumes (none). */
export const inject = [] as const;

/**
 * Host plugin body: no host-side registrations. The entry exists so a
 * composition row can mount this package by name — the dsh Loader requires
 * an `apply` export on the host face it loads. Theme registration happens on
 * the browser side through the `/client` entry.
 */
export function apply(_ctx: unknown): void {}
