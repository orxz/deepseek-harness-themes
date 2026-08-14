import { registerThemes, themes } from "@deepseek-harness-themes/core";
import { createPicker } from "./picker.ts";
import type {
  PickerSettingsScope,
  PickerThemeService,
  ThemeChangePayload,
} from "./picker.ts";
import { createPickerStore } from "./store.ts";
import type { PickerStoreActions, PickerStoreState } from "./store.ts";
import type { BakedActions } from "@deepseek-ai/dsh-client-runtime/client";
import { en, zh } from "./locales.ts";
import { THEMES_NAMESPACE } from "./preference.ts";
import type { ThemePreferenceSettings } from "./preference.ts";
import { ThemePickerRow } from "./ThemePickerRow.tsx";
import type { ThemeFace } from "./ThemePickerRow.tsx";

/** Locale namespace owning this row's copy. */
export const SETTINGS_NS = "settings.dsh-themes";

/**
 * Swatch colours for every shipped theme, read from the catalog this package
 * already bundles. The host theme snapshot carries no token payload, so the
 * picker gets its preview colours from here rather than widening that
 * contract. Themes absent from this table (registered by another plugin)
 * render without a swatch and under a humanized id.
 */
export const THEME_FACES: Readonly<Record<string, ThemeFace>> = Object.freeze(
  Object.fromEntries(
    themes.map((theme) => [
      theme.id,
      // Both tokens are in REQUIRED_TOKENS, which `pnpm test` enforces for
      // every shipped theme, so neither lookup can miss.
      Object.freeze({
        base: theme.tokens["--dsw-alias-bg-base"] as string,
        accent: theme.tokens["--dsw-alias-brand-primary"] as string,
      }),
    ]),
  ),
);

/**
 * The browser plugin face the dsh loader mounts. Declared structurally so the
 * package type-checks without the dsh application tree; at runtime the real
 * client Context satisfies it.
 */
export interface PickerClientContext {
  effect(thunk: () => unknown, label?: string): void;
  on(event: string, listener: (payload: unknown) => void): () => void;
  theme: PickerThemeService;
  settingsScope: {
    bind<T>(spec: { namespace: string }): PickerSettingsScope<T>;
  };
  slots: {
    inject(name: string, factory: () => unknown): void;
    register(entry: unknown, component: unknown): unknown;
  };
  locale: {
    register(
      namespace: string,
      dict: Record<string, Record<string, string>>,
    ): void;
  };
}

/** Services this plugin consumes. */
export const inject = ["theme", "settingsScope", "slots", "locale"] as const;

/**
 * Client plugin body: register all shipped themes, own the durable
 * third-party selection, and inject the picker row into the settings General
 * section (id `themes`, order 11 — right after the host Appearance row).
 */
export function apply(ctx: PickerClientContext): void {
  ctx.effect(() => registerThemes(ctx.theme), "dsh-themes: register themes");
  const scope = ctx.settingsScope.bind<ThemePreferenceSettings>({
    namespace: THEMES_NAMESPACE,
  });
  ctx.effect(
    () => ctx.locale.register(SETTINGS_NS, { en, zh }),
    "dsh-themes: picker locale",
  );

  const picker = createPicker(ctx.theme, scope);
  const store = createPickerStore();

  const mirror = (): PickerStoreState => {
    const snapshot = picker.getTheme();
    return {
      preference: snapshot.preference,
      activeId: snapshot.active.id,
      themes: snapshot.themes,
      revision: snapshot.revision,
    };
  };

  let bound: BakedActions<PickerStoreState, PickerStoreActions> | undefined;
  const syncStore = (): void => {
    bound?.sync(mirror());
  };

  ctx.effect(() => {
    const offChange = ctx.on("theme/change", (payload) => {
      void picker.sync(payload as ThemeChangePayload);
      syncStore();
    });
    picker.restore();
    syncStore();
    return () => {
      offChange();
      picker.dispose();
    };
  }, "dsh-themes: picker lifecycle");

  ctx.slots.inject("settings.general.item", () =>
    ctx.slots.register(
      {
        name: "settings.general.item",
        id: "themes",
        order: 11,
        store,
        locale: SETTINGS_NS,
        inject: (
          actions: BakedActions<PickerStoreState, PickerStoreActions>,
        ) => {
          bound = actions;
          syncStore();
          return {
            faces: THEME_FACES,
            setTheme: (id: string) => {
              picker.setTheme(id);
            },
          };
        },
      },
      ThemePickerRow,
    ),
  );
}
