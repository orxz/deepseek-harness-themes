/**
 * Durable settings schema for the picker's namespace, expressed with
 * `@deepseek-ai/schemastery` (the host's schema library) so Host-side
 * registration reuses it verbatim.
 *
 * Only the Node half imports this module. Schemastery is a host package the
 * dsh installation resolves through the profile's module fallback; the
 * browser module table does not serve it, so pulling this module into the
 * client bundle would fail the plugin load.
 */

import z from "@deepseek-ai/schemastery";
import { DEFAULT_SELECTION, THEME_FIELD } from "./preference.ts";
import type { ThemePreferenceSettings } from "./preference.ts";

/**
 * Durable schema; also the wire envelope the settings scope validates
 * against. The default keeps the field optional in the stored document.
 */
export const THEME_PREFERENCE_SCHEMA: z<ThemePreferenceSettings> = z.object({
  [THEME_FIELD]: z.string().default(DEFAULT_SELECTION),
});
