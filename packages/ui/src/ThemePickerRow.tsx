import clsx from "clsx";
import type { PickerStoreState } from "./store.ts";
import css from "./ThemePickerRow.module.css";

export type { PickerStoreState };

/** Props composed by the slot framework: store hook, locale seat, injected face. */
export interface ThemePickerRowProps {
  useStore: <T>(selector: (state: PickerStoreState) => T) => T;
  t: (key: string) => string;
  setTheme: (id: string) => void;
}

const BUILTINS = [
  { id: "light", labelKey: "picker.light" },
  { id: "dark", labelKey: "picker.dark" },
  { id: "system", labelKey: "picker.system" },
] as const;

const BUILTIN_IDS = new Set<string>(BUILTINS.map((entry) => entry.id));

/**
 * Theme picker row: the built-in preference cubes plus one entry per
 * registered third-party theme (the built-in pair is already represented by
 * its own cubes). Selection goes through the injected `setTheme`; the
 * pressed state follows the preference.
 */
export function ThemePickerRow({ useStore, t, setTheme }: ThemePickerRowProps) {
  const preference = useStore((state) => state.preference);
  const themes = useStore((state) => state.themes);
  const thirdParty = themes.filter((theme) => !BUILTIN_IDS.has(theme.id));
  return (
    <div className={css.group}>
      <div className={css.title}>{t("picker.title")}</div>
      <div className={css.cubeRow}>
        {BUILTINS.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={clsx(css.themeCube, preference === id && css.selected)}
            aria-pressed={preference === id}
            onClick={() => {
              setTheme(id);
            }}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
      {thirdParty.length > 0 && (
        <div className={css.themeList}>
          {thirdParty.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={clsx(
                css.themeItem,
                preference === theme.id && css.selected,
              )}
              aria-pressed={preference === theme.id}
              onClick={() => {
                setTheme(theme.id);
              }}
            >
              {t(`theme.${theme.id}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
