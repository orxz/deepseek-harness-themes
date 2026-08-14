import { describe, expect, it, vi } from "vitest";
import { themes } from "@deepseek-harness-themes/core";
import { createPicker } from "../src/picker.ts";
import type { PickerThemeService, PickerSettingsScope } from "../src/picker.ts";

/** Build a theme service stub backed by the shipped catalog. */
function makeThemeService(
  overrides: Partial<PickerThemeService> = {},
): PickerThemeService {
  const registered = [...themes];
  const state: {
    preference: string;
    activeId: string;
    activeScheme: "light" | "dark";
    revision: number;
  } = {
    preference: "system",
    activeId: "dark",
    activeScheme: "dark",
    revision: 0,
  };
  return {
    register: vi.fn(() => () => {}),
    getTheme: vi.fn(() => ({
      preference: state.preference,
      active: {
        id: state.activeId,
        colorScheme: state.activeScheme,
        tokens: {},
      },
      themes: registered,
      revision: state.revision,
    })),
    setTheme: vi.fn((id: string) => {
      state.preference = id;
      state.activeId = id === "system" ? "dark" : id;
      const found = registered.find((t) => t.id === id);
      if (found !== undefined) state.activeScheme = found.colorScheme;
      state.revision += 1;
    }),
    ...overrides,
  };
}

/** Build a settings scope stub with a mutable durable section. */
function makeScope(
  initial: Record<string, unknown> = {},
  initialStatus: string = "ready",
): PickerSettingsScope<{ theme?: string }> {
  const listeners: Array<() => void> = [];
  let section = initial;
  let status = initialStatus;
  return {
    getSnapshot: vi.fn(() => ({
      status,
      value: section as { theme?: string } | undefined,
      writable: true,
      mode: "host",
    })),
    subscribe: vi.fn((listener: () => void) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      };
    }),
    set: vi.fn(async (field: string, value: unknown) => {
      status = "ready";
      section = { ...section, [field]: value };
      for (const listener of listeners) listener();
    }),
  };
}

describe("createPicker", () => {
  it("restores a persisted third-party theme that is still registered", () => {
    const theme = makeThemeService();
    const scope = makeScope({ theme: "catppuccin" });
    const picker = createPicker(theme, scope);

    picker.restore();

    expect(theme.setTheme).toHaveBeenCalledWith("catppuccin");
  });

  it("ignores a persisted value that is no longer registered", () => {
    const theme = makeThemeService();
    const scope = makeScope({ theme: "unknown-theme" });
    const picker = createPicker(theme, scope);

    picker.restore();

    expect(theme.setTheme).not.toHaveBeenCalled();
  });

  it("ignores the system default marker on restore", () => {
    const theme = makeThemeService();
    const scope = makeScope({ theme: "system" });
    const picker = createPicker(theme, scope);

    picker.restore();

    expect(theme.setTheme).not.toHaveBeenCalled();
  });

  it("ignores a non-string persisted value on restore", () => {
    const theme = makeThemeService();
    const scope = makeScope({ theme: 7 });
    const picker = createPicker(theme, scope);

    picker.restore();

    expect(theme.setTheme).not.toHaveBeenCalled();
  });

  it("restores a persisted selection once the scope becomes ready", async () => {
    const theme = makeThemeService();
    const scope = makeScope({}, "loading");
    const picker = createPicker(theme, scope);

    picker.restore();
    expect(theme.setTheme).not.toHaveBeenCalled();

    // The scope settles with the persisted section; the subscription fires.
    await scope.set("theme", "catppuccin");

    expect(theme.setTheme).toHaveBeenCalledWith("catppuccin");
  });

  it("restores immediately when the scope is already ready at creation", () => {
    const theme = makeThemeService();
    const scope = makeScope({ theme: "catppuccin" });

    createPicker(theme, scope);

    expect(theme.setTheme).toHaveBeenCalledWith("catppuccin");
  });

  it("persists a third-party active theme on sync", async () => {
    const theme = makeThemeService();
    const scope = makeScope();
    const picker = createPicker(theme, scope);

    await picker.sync({
      preference: "catppuccin",
      active: { id: "catppuccin", colorScheme: "dark" },
    });

    expect(scope.set).toHaveBeenCalledWith("theme", "catppuccin");
  });

  it("resets the durable marker when the active theme is built-in", async () => {
    const theme = makeThemeService();
    const scope = makeScope({ theme: "catppuccin" });
    const picker = createPicker(theme, scope);

    await picker.sync({
      preference: "light",
      active: { id: "light", colorScheme: "light" },
    });

    expect(scope.set).toHaveBeenCalledWith("theme", "system");
  });

  it("does not rewrite an already-clear marker for built-in actives", async () => {
    const theme = makeThemeService();
    const scope = makeScope({ theme: "system" });
    const picker = createPicker(theme, scope);

    await picker.sync({
      preference: "dark",
      active: { id: "dark", colorScheme: "dark" },
    });

    expect(scope.set).not.toHaveBeenCalled();
  });

  it("skips a redundant durable write when the marker already matches", async () => {
    const theme = makeThemeService();
    const scope = makeScope({ theme: "catppuccin" });
    const picker = createPicker(theme, scope);

    await picker.sync({
      preference: "catppuccin",
      active: { id: "catppuccin", colorScheme: "dark" },
    });

    expect(scope.set).not.toHaveBeenCalled();
  });

  it("delegates selection to the theme service", () => {
    const theme = makeThemeService();
    const scope = makeScope();
    const picker = createPicker(theme, scope);

    picker.setTheme("dracula");

    expect(theme.setTheme).toHaveBeenCalledWith("dracula");
  });

  it("exposes the current snapshot through getTheme", () => {
    const theme = makeThemeService();
    const scope = makeScope();
    const picker = createPicker(theme, scope);

    const snapshot = picker.getTheme();
    expect(snapshot.preference).toBe("system");
    expect(snapshot.active.id).toBe("dark");
    expect(snapshot.themes.map((t) => t.id)).toEqual(themes.map((t) => t.id));
  });

  it("subscribes to the scope for teardown on dispose", () => {
    const theme = makeThemeService();
    const scope = makeScope();
    const picker = createPicker(theme, scope);

    picker.dispose();

    expect(scope.subscribe).toHaveBeenCalledTimes(1);
  });
});
