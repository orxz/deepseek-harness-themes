import clsx from "clsx";
import type { KeyboardEvent } from "react";
import type { PickerStoreState } from "./store.ts";
import css from "./ThemePickerRow.module.css";

export type { PickerStoreState };

/** The two colours that identify one theme at a glance. */
export interface ThemeFace {
  base: string;
  accent: string;
}

/** Props composed by the slot framework: store hook, locale seat, injected face. */
export interface ThemePickerRowProps {
  useStore: <T>(selector: (state: PickerStoreState) => T) => T;
  t: (key: string) => string;
  setTheme: (id: string) => void;
  faces: Readonly<Record<string, ThemeFace>>;
}

const BUILTINS = [
  { id: "light", labelKey: "picker.light" },
  { id: "dark", labelKey: "picker.dark" },
  { id: "system", labelKey: "picker.system" },
] as const;

const BUILTIN_IDS = new Set<string>(BUILTINS.map((entry) => entry.id));

/** Keyboard steps the radiogroup answers to; other keys fall through. */
const STEPS: Readonly<Record<string, number | "home" | "end">> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
  Home: "home",
  End: "end",
};

/**
 * Title-case a theme id so a theme registered by another plugin still reads
 * as a name when this package's dictionary has no entry for it.
 */
function humanize(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Theme picker row: the built-in preference cubes plus one swatched entry per
 * registered third-party theme, all inside one radiogroup because the
 * preference holds a single value. Selection goes through the injected
 * `setTheme`; the checked state follows the preference.
 */
export function ThemePickerRow({
  useStore,
  t,
  setTheme,
  faces,
}: ThemePickerRowProps) {
  const preference = useStore((state) => state.preference);
  const themes = useStore((state) => state.themes);
  const thirdParty = themes.filter((theme) => !BUILTIN_IDS.has(theme.id));
  const ids = [
    ...BUILTINS.map((entry) => entry.id),
    ...thirdParty.map((theme) => theme.id),
  ];
  const checkedIndex = ids.indexOf(preference);

  /** Arrow keys move the selection, matching the WAI-ARIA radiogroup pattern. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const step = STEPS[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const size = ids.length;
    const to =
      step === "home"
        ? 0
        : step === "end"
          ? size - 1
          : (Math.max(checkedIndex, 0) + step + size) % size;
    // `to` is derived from `ids.length`, so both lookups below are in range.
    const nextId = ids[to] as string;
    setTheme(nextId);
    event.currentTarget
      .querySelector<HTMLElement>(`[data-theme-id="${nextId}"]`)!
      .focus();
  };

  /** Shared radio wiring so the cubes and the swatch grid stay one group. */
  const radioProps = (id: string) => ({
    type: "button" as const,
    role: "radio",
    "aria-checked": preference === id,
    "data-theme-id": id,
    tabIndex: (checkedIndex < 0 ? id === ids[0] : preference === id) ? 0 : -1,
    onClick: () => {
      setTheme(id);
    },
  });

  return (
    <div className={css.group}>
      <div className={css.title} id="dsh-themes-label">
        {t("picker.title")}
      </div>
      <div
        role="radiogroup"
        aria-labelledby="dsh-themes-label"
        onKeyDown={onKeyDown}
      >
        <div className={css.cubeRow}>
          {BUILTINS.map(({ id, labelKey }) => (
            <button
              key={id}
              {...radioProps(id)}
              className={clsx(css.themeCube, preference === id && css.selected)}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        {thirdParty.length > 0 && (
          <div className={css.themeList}>
            {thirdParty.map((theme) => {
              const face = faces[theme.id];
              return (
                <button
                  key={theme.id}
                  {...radioProps(theme.id)}
                  className={clsx(
                    css.themeItem,
                    preference === theme.id && css.selected,
                  )}
                >
                  {face !== undefined && (
                    <span
                      data-swatch=""
                      aria-hidden="true"
                      className={css.swatch}
                      style={{ background: face.base }}
                    >
                      <span
                        className={css.swatchAccent}
                        style={{ background: face.accent }}
                      />
                    </span>
                  )}
                  <span className={css.themeName}>
                    {face === undefined
                      ? humanize(theme.id)
                      : t(`theme.${theme.id}`)}
                  </span>
                  <span aria-hidden="true" className={css.tick} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
