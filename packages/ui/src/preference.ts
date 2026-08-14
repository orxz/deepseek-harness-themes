/**
 * Durable selection contract for third-party themes.
 *
 * The host's built-in theme schema (`ui-theme.preference`) only accepts
 * `light`/`dark`/`system`, so this plugin owns its own settings namespace for
 * third-party ids. The value `system` is the sentinel meaning "no override —
 * follow the host preference". The schema is expressed with
 * `@deepseek-ai/schemastery` (the host's schema library) so Host-side
 * registration can reuse it verbatim.
 */

import z from "@deepseek-ai/schemastery";

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
 * Durable schema; also the wire envelope the settings scope validates
 * against. The default keeps the field optional in the stored document.
 */
export const THEME_PREFERENCE_SCHEMA: z<ThemePreferenceSettings> = z.object({
  [THEME_FIELD]: z.string().default(DEFAULT_SELECTION),
});

/**
 * Narrow one wire or registry value to a persistable selection.
 * @param value - value crossing the settings boundary.
 * @returns whether the value is a string selection.
 */
export function isThemeSelection(value: unknown): value is string {
  return typeof value === "string";
}
