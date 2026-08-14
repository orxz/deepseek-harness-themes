/**
 * Durable selection contract for third-party themes.
 *
 * The host's built-in theme schema (`ui-theme.preference`) only accepts
 * `light`/`dark`/`system`, so this plugin owns its own settings namespace for
 * third-party ids. The value `system` is the sentinel meaning "no override —
 * follow the host preference".
 *
 * Both halves of the plugin import this module, so it stays free of host
 * packages: the browser module table serves platform seed words and shell-own
 * modules only, and a client bundle requiring anything else fails to load.
 * The schemastery envelope built on these names lives in `./schema.ts`, which
 * only the Node half imports.
 */

/** Settings namespace owned by the picker plugin. */
export const THEMES_NAMESPACE = "dsh-themes";

/** Field carrying the selected third-party theme id (or `system`). */
export const THEME_FIELD = "theme";

/** Durable marker meaning "no third-party override; follow the host". */
export const DEFAULT_SELECTION = "system";

/** Durable section shared with the Host settings schema. */
export interface ThemePreferenceSettings {
  theme?: string;
}

/**
 * Narrow one wire or registry value to a persistable selection.
 * @param value - value crossing the settings boundary.
 * @returns whether the value is a string selection.
 */
export function isThemeSelection(value: unknown): value is string {
  return typeof value === "string";
}
