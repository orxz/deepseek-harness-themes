import { registerThemes } from "./index.ts";
import type { ThemeRegistry } from "./types.ts";

/**
 * The browser plugin face the dsh loader mounts. Declared structurally so the
 * package type-checks without the dsh application tree; at runtime the real
 * client Context (with `ctx.theme` from `dsh-client-ui-theme`) satisfies it.
 */
export interface ClientThemeContext {
  theme: ThemeRegistry;
  effect(thunk: () => unknown, label?: string): void;
}

/** Services this plugin consumes. */
export const inject = ["theme"] as const;

/**
 * Client plugin body: register all shipped themes through a labelled effect,
 * so unload tears every registration down.
 */
export function apply(ctx: ClientThemeContext): void {
  ctx.effect(
    () => registerThemes(ctx.theme),
    "dsh-themes-core: register themes",
  );
}
