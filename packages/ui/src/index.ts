/**
 * Host-side registration for the picker's durable settings namespace. The
 * browser plugin body lives in `./client.ts`; this entry is the Node half the
 * dsh Loader mounts when a composition row names this package, mirroring the
 * host/client split of `@deepseek-ai/dsh-client-ui-theme` (its Host entry
 * registers the settings namespace, its client entry owns the browser face).
 *
 * Declared structurally so the package type-checks without the dsh
 * application tree; at runtime the real host Context satisfies it.
 */

import { THEME_PREFERENCE_SCHEMA, THEMES_NAMESPACE } from "./preference.ts";

/** The host settings face this entry consumes. */
export interface HostSettingsService {
  register(namespace: string, schema: unknown): void;
}

/** The host plugin face the dsh Loader mounts. */
export interface PickerHostContext {
  inject(
    deps: string[],
    callback: (ctx: { settings: HostSettingsService }) => void,
  ): void;
}

/** Optional services this entry consumes. */
export const inject = ["settings"] as const;

/**
 * Host plugin body: register the durable `dsh-themes` namespace into the Host
 * settings service when one is composed, so the settings document accepts and
 * schema-validates the third-party theme selection.
 */
export function apply(ctx: PickerHostContext): void {
  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.settings.register(THEMES_NAMESPACE, THEME_PREFERENCE_SCHEMA);
  });
}
