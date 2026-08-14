// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ThemePickerRow,
  type ThemePickerRowProps,
} from "../src/ThemePickerRow.tsx";
import type { PickerStoreState } from "../src/store.ts";

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
  preference: "midnight",
  activeId: "midnight",
  themes: [
    { id: "light", colorScheme: "light" },
    { id: "dark", colorScheme: "dark" },
    { id: "midnight", colorScheme: "dark" },
    { id: "nord", colorScheme: "dark" },
    { id: "minimal", colorScheme: "light" },
  ],
  revision: 1,
};

describe("ThemePickerRow", () => {
  it("renders the built-in selection cubes always", () => {
    render(<ThemePickerRow {...makeProps(BUILTINS)} />);

    for (const key of ["picker.light", "picker.dark", "picker.system"]) {
      expect(screen.getByText(`[${key}]`)).toBeTruthy();
    }
  });

  it("lists third-party themes with pressed state following the preference", () => {
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY)} />);

    for (const id of ["midnight", "nord", "minimal"]) {
      const button = screen.getByText(`[theme.${id}]`).closest("button");
      expect(button).toBeTruthy();
      expect(button?.getAttribute("aria-pressed")).toBe(
        id === "midnight" ? "true" : "false",
      );
    }
  });

  it("omits the built-in pair from the third-party list", () => {
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY)} />);

    expect(screen.queryByText("[theme.light]")).toBeNull();
    expect(screen.queryByText("[theme.dark]")).toBeNull();
  });

  it("marks the built-in cube pressed when it is the preference", () => {
    const state: PickerStoreState = {
      ...BUILTINS,
      preference: "light",
      activeId: "light",
    };
    render(<ThemePickerRow {...makeProps(state)} />);

    const button = screen.getByText("[picker.light]").closest("button");
    expect(button?.getAttribute("aria-pressed")).toBe("true");
  });

  it("delegates third-party selection to the injected setTheme", () => {
    const setTheme = vi.fn();
    render(<ThemePickerRow {...makeProps(WITH_THIRD_PARTY, { setTheme })} />);

    fireEvent.click(screen.getByText("[theme.nord]"));

    expect(setTheme).toHaveBeenCalledWith("nord");
  });

  it("delegates built-in selection to the injected setTheme", () => {
    const setTheme = vi.fn();
    render(<ThemePickerRow {...makeProps(BUILTINS, { setTheme })} />);

    fireEvent.click(screen.getByText("[picker.system]"));

    expect(setTheme).toHaveBeenCalledWith("system");
  });
});
