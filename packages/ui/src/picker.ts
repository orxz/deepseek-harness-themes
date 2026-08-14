import type { ThemeRegistry } from "@deepseek-harness-themes/core";
import {
  DEFAULT_SELECTION,
  isThemeSelection,
  THEME_FIELD,
} from "./preference.ts";
import type { ThemePreferenceSettings } from "./preference.ts";

/** One theme as the picker renders it (no token payload). */
export interface PickerTheme {
  id: string;
  colorScheme: "light" | "dark";
}

/** Snapshot subset the picker consumes from the host theme service. */
export interface PickerThemeSnapshot {
  preference: string;
  active: PickerTheme;
  themes: readonly PickerTheme[];
  revision: number;
}

/** Payload carried by the host's `theme/change` event. */
export interface ThemeChangePayload {
  preference: string;
  active: PickerTheme;
}

/** The host theme service face the picker consumes (a superset of registration). */
export interface PickerThemeService extends ThemeRegistry {
  getTheme(): PickerThemeSnapshot;
  setTheme(id: string): void;
}

/** Durable scope face the picker consumes (mirrors the host SettingsScope). */
export interface PickerSettingsScope<T> {
  getSnapshot(): {
    status: string;
    value: T | undefined;
    writable: boolean;
    mode: string;
  };
  subscribe(listener: () => void): () => void;
  set(field: string, value: unknown): Promise<void>;
}

/** One assembled picker instance. */
export interface Picker {
  /** Adopt the persisted third-party selection when it is still registered. */
  restore(): void;
  /** Persist the active theme when it is third-party; clear the marker for built-ins. */
  sync(payload: ThemeChangePayload): Promise<void>;
  /** Switch the theme through the host service. */
  setTheme(id: string): void;
  /** Read the current theme snapshot. */
  getTheme(): PickerThemeSnapshot;
  /** Drop the scope subscription. */
  dispose(): void;
}

const BUILTIN_IDS = new Set(["light", "dark"]);

/**
 * Assemble a picker over the host theme service and the durable settings
 * scope. All reads go through the service snapshot; all writes either the
 * service (selection) or the scope (durability).
 */
export function createPicker(
  theme: PickerThemeService,
  scope: PickerSettingsScope<ThemePreferenceSettings>,
): Picker {
  /**
   * Adopt the persisted third-party selection once the durable scope is
   * ready. The host SettingsScope performs its initial read in the
   * background (activation never blocks on it), so this runs both at
   * creation and on every scope update until a registered value lands;
   * `setTheme` with an unchanged id is a host-side no-op, so retries are
   * safe.
   */
  const tryRestore = (): void => {
    const snapshot = scope.getSnapshot();
    if (snapshot.status !== "ready") return;
    const persisted = snapshot.value?.theme;
    if (!isThemeSelection(persisted) || persisted === DEFAULT_SELECTION) return;
    const registered = theme
      .getTheme()
      .themes.some((candidate) => candidate.id === persisted);
    if (!registered) return;
    theme.setTheme(persisted);
  };

  const unsubScope = scope.subscribe(tryRestore);
  tryRestore();

  return {
    getTheme(): PickerThemeSnapshot {
      return theme.getTheme();
    },
    restore(): void {
      tryRestore();
    },
    async sync(payload: ThemeChangePayload): Promise<void> {
      const activeId = payload.active.id;
      if (BUILTIN_IDS.has(activeId)) {
        const current = scope.getSnapshot().value?.theme;
        if (current !== undefined && current !== DEFAULT_SELECTION) {
          await scope.set(THEME_FIELD, DEFAULT_SELECTION);
        }
        return;
      }
      const current = scope.getSnapshot().value?.theme;
      if (current === activeId) return;
      await scope.set(THEME_FIELD, activeId);
    },
    setTheme(id: string): void {
      theme.setTheme(id);
    },
    dispose(): void {
      unsubScope();
    },
  };
}
