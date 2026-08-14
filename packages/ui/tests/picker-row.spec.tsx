// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ThemePickerRow,
  type ThemeFace,
  type ThemePickerRowProps,
} from "../src/ThemePickerRow.tsx";
import type { PickerStoreState } from "../src/store.ts";

const FACES: Record<string, ThemeFace> = {
  catppuccin: { base: "#1e1e2e", accent: "#cba6f7" },
  dracula: { base: "#282a36", accent: "#bd93f9" },
  oled: { base: "#000000", accent: "#ffffff" },
};

/** Build a picker row props face over one mutable state cell. */
function makeProps(
  state: PickerStoreState,
  overrides: Partial<ThemePickerRowProps> = {},
) {
  return {
    useStore: <T,>(selector: (state: PickerStoreState) => T): T =>
      selector(state),
    t: (key: string) => `[${key}]`,
    setTheme: vi.fn(),
    faces: FACES,
    ...overrides,
  } satisfies ThemePickerRowProps;
}

const BUILTINS: PickerStoreState = {
  preference: "system",
  activeId: "dark",
  themes: [],
  revision: 1,
};

const WITH_THIRD_PARTY: PickerStoreState = {
  preference: "catppuccin",
  activeId: "catppuccin",
  themes: [
    { id: "light", colorScheme: "light" },
    { id: "dark", colorScheme: "dark" },
    { id: "catppuccin", colorScheme: "dark" },
    { id: "dracula", colorScheme: "dark" },
    { id: "oled", colorScheme: "light" },
  ],
  revision: 1,
};

const radios = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="radio"]'));

describe("ThemePickerRow", () => {
  it("renders the built-in selection cubes always", () => {
    render(<ThemePickerRow {...makeProps(BUILTINS)} />);

    for (const key of ["picker.light", "picker.dark", "picker.system"]) {
      expect(screen.getByText(`[${key}]`)).toBeTruthy();
    }
  });

  it("exposes one radiogroup holding every selectable theme", () => {
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY)} />);

    expect(screen.getAllByRole("radiogroup")).toHaveLength(1);
    expect(radios()).toHaveLength(6);
  });

  it("checks exactly the option matching the preference", () => {
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY)} />);

    const checked = radios().filter(
      (node) => node.getAttribute("aria-checked") === "true",
    );
    expect(checked).toHaveLength(1);
    expect(checked[0]?.dataset.themeId).toBe("catppuccin");
  });

  it("keeps one tab stop by roving tabindex onto the checked option", () => {
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY)} />);

    const tabbable = radios().filter((node) => node.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]?.dataset.themeId).toBe("catppuccin");
  });

  it("falls back to the first option when the preference is unregistered", () => {
    const state = { ...WITH_THIRD_PARTY, preference: "gone" };
    render(<ThemePickerRow {...makeProps(state)} />);

    expect(radios().filter((node) => node.tabIndex === 0)).toHaveLength(1);
    expect(radios()[0]?.tabIndex).toBe(0);
  });

  it("paints a swatch for shipped themes and none for the built-in cubes", () => {
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY)} />);

    const dracula = radios().find((node) => node.dataset.themeId === "dracula");
    const system = radios().find((node) => node.dataset.themeId === "system");
    expect(dracula?.querySelector("[data-swatch]")).toBeTruthy();
    expect(system?.querySelector("[data-swatch]")).toBeNull();
  });

  it("humanizes themes registered without a dictionary entry", () => {
    const state: PickerStoreState = {
      ...WITH_THIRD_PARTY,
      themes: [
        ...WITH_THIRD_PARTY.themes,
        { id: "solarized-light", colorScheme: "light" },
      ],
    };
    render(<ThemePickerRow {...makeProps(state)} />);

    expect(screen.getByText("Solarized Light")).toBeTruthy();
    expect(screen.queryByText("[theme.solarized-light]")).toBeNull();
  });

  it("omits the built-in pair from the third-party list", () => {
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY)} />);

    expect(screen.queryByText("[theme.light]")).toBeNull();
    expect(screen.queryByText("[theme.dark]")).toBeNull();
  });

  it("delegates click selection to the injected setTheme", () => {
    const setTheme = vi.fn();
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY, { setTheme })} />);

    fireEvent.click(screen.getByText("[theme.dracula]"));
    fireEvent.click(screen.getByText("[picker.system]"));

    expect(setTheme).toHaveBeenNthCalledWith(1, "dracula");
    expect(setTheme).toHaveBeenNthCalledWith(2, "system");
  });

  it("moves selection and focus with the arrow keys", () => {
    const setTheme = vi.fn();
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY, { setTheme })} />);
    const group = screen.getByRole("radiogroup");

    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(setTheme).toHaveBeenLastCalledWith("dracula");
    expect(document.activeElement).toBe(
      radios().find((node) => node.dataset.themeId === "dracula"),
    );

    // The spy does not advance the store, so this step still starts at catppuccin.
    fireEvent.keyDown(group, { key: "ArrowUp" });
    expect(setTheme).toHaveBeenLastCalledWith("system");
  });

  it("wraps at both ends and jumps with Home and End", () => {
    const setTheme = vi.fn();
    const first = { ...WITH_THIRD_PARTY, preference: "light" };
    const { rerender } = render(
      <ThemePickerRow {...makeProps(first, { setTheme })} />,
    );
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowLeft" });
    expect(setTheme).toHaveBeenLastCalledWith("oled");

    const last = { ...WITH_THIRD_PARTY, preference: "oled" };
    rerender(<ThemePickerRow {...makeProps(last, { setTheme })} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });
    expect(setTheme).toHaveBeenLastCalledWith("light");

    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "End" });
    expect(setTheme).toHaveBeenLastCalledWith("oled");
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "Home" });
    expect(setTheme).toHaveBeenLastCalledWith("light");
  });

  it("ignores keys that do not drive the radiogroup", () => {
    const setTheme = vi.fn();
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY, { setTheme })} />);

    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "a" });

    expect(setTheme).not.toHaveBeenCalled();
  });
});
