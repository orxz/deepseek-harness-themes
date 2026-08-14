import { describe, expect, it, vi } from "vitest";
import { apply, inject, SETTINGS_NS } from "../src/client.ts";
import type { PickerClientContext } from "../src/client.ts";

/** Build a fake client context capturing every seam the plugin touches. */
function makeCtx() {
  const effect = vi.fn((thunk: () => unknown, _label?: string) => thunk());
  const register = vi.fn(() => () => {});
  const setTheme = vi.fn();
  const getTheme = vi.fn(() => ({
    preference: "system",
    active: { id: "dark", colorScheme: "dark" as const, tokens: {} },
    themes: [
      { id: "catppuccin", colorScheme: "dark" as const, tokens: {} },
      { id: "dracula", colorScheme: "dark" as const, tokens: {} },
    ],
    revision: 0,
  }));
  const scope = {
    getSnapshot: vi.fn(() => ({
      status: "ready" as const,
      value: undefined as unknown,
      writable: true,
      mode: "host" as const,
    })),
    subscribe: vi.fn(() => subscribeDispose),
    set: vi.fn(async () => {}),
  };
  const bind = vi.fn(() => scope);
  const slotsInject = vi.fn((_name: string, factory: () => unknown) =>
    factory(),
  );
  const slotsRegister = vi.fn((_entry: unknown, _component: unknown) => ({}));
  const localeRegister = vi.fn();
  const subscribeDispose = vi.fn();
  const listeners = new Map<string, Array<(payload: unknown) => void>>();
  const on = vi.fn((event: string, listener: (payload: unknown) => void) => {
    const list = listeners.get(event) ?? [];
    list.push(listener);
    listeners.set(event, list);
    return onDispose;
  });
  const onDispose = vi.fn();
  const ctx = {
    effect,
    on,
    theme: { register, setTheme, getTheme },
    settingsScope: { bind },
    slots: { inject: slotsInject, register: slotsRegister },
    locale: { register: localeRegister },
  } as PickerClientContext;
  return {
    ctx,
    effect,
    register,
    setTheme,
    getTheme,
    bind,
    scope,
    slotsInject,
    slotsRegister,
    localeRegister,
    onDispose,
    subscribeDispose,
    emit: (event: string, payload: unknown) => {
      for (const listener of listeners.get(event) ?? []) listener(payload);
    },
  };
}

describe("ui plugin assembly", () => {
  it("declares the seam injections it consumes", () => {
    expect([...inject].sort()).toEqual([
      "locale",
      "settingsScope",
      "slots",
      "theme",
    ]);
  });

  it("registers all themes through a labelled effect", () => {
    const { ctx, effect, register } = makeCtx();

    apply(ctx);

    expect(
      effect.mock.calls.some(
        (call) => call[1] === "dsh-themes: register themes",
      ),
    ).toBe(true);
    expect(register).toHaveBeenCalled();
  });

  it("binds the dsh-themes settings namespace", () => {
    const { ctx, bind } = makeCtx();

    apply(ctx);

    expect(bind).toHaveBeenCalledWith({ namespace: "dsh-themes" });
  });

  it("registers picker dictionaries through a labelled effect", () => {
    const { ctx, effect, localeRegister } = makeCtx();

    apply(ctx);

    expect(
      effect.mock.calls.some((call) => call[1] === "dsh-themes: picker locale"),
    ).toBe(true);
    expect(localeRegister).toHaveBeenCalledWith(
      SETTINGS_NS,
      expect.objectContaining({ en: expect.anything(), zh: expect.anything() }),
    );
  });

  it("injects the picker row into the settings general item slot", () => {
    const { ctx, slotsInject, slotsRegister } = makeCtx();

    apply(ctx);

    expect(slotsInject).toHaveBeenCalledWith(
      "settings.general.item",
      expect.any(Function),
    );
    expect(slotsRegister).toHaveBeenCalledTimes(1);
    const entry = slotsRegister.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(entry.name).toBe("settings.general.item");
    expect(entry.id).toBe("themes");
    expect(entry.order).toBe(11);
    expect(entry.locale).toBe(SETTINGS_NS);
  });

  it("routes the injected setTheme face to the theme service", () => {
    const { ctx, setTheme, slotsRegister } = makeCtx();

    apply(ctx);

    const entry = slotsRegister.mock.calls[0]?.[0] as {
      inject: (actions: unknown) => { setTheme: (id: string) => void };
    };
    const face = entry.inject({ sync: () => {} });
    face.setTheme("dracula");

    expect(setTheme).toHaveBeenCalledWith("dracula");
  });

  it("restores the persisted selection on activation", () => {
    const { ctx, scope, setTheme } = makeCtx();
    scope.getSnapshot = vi.fn(() => ({
      status: "ready" as const,
      value: { theme: "catppuccin" },
      writable: true,
      mode: "host" as const,
    }));

    apply(ctx);

    expect(setTheme).toHaveBeenCalledWith("catppuccin");
  });

  it("listens for theme/change and persists third-party actives", async () => {
    const { ctx, scope, emit } = makeCtx();

    apply(ctx);
    await Promise.resolve();
    emit("theme/change", {
      preference: "dracula",
      active: { id: "dracula", colorScheme: "dark" },
    });
    await Promise.resolve();

    expect(scope.set).toHaveBeenCalledWith("theme", "dracula");
  });

  it("tears the picker lifecycle down through the effect disposer", () => {
    const { ctx, effect, onDispose, scope, subscribeDispose } = makeCtx();

    apply(ctx);

    // The lifecycle effect is the one returning the picker teardown.
    const lifecycleCall = effect.mock.results.find((result, index) => {
      return (
        effect.mock.calls[index]?.[1] === "dsh-themes: picker lifecycle" &&
        typeof result.value === "function"
      );
    });
    const teardown = lifecycleCall?.value as () => void;
    expect(teardown).toBeTypeOf("function");

    teardown();

    expect(onDispose).toHaveBeenCalledTimes(1);
    expect(subscribeDispose).toHaveBeenCalledTimes(1);
    expect(scope.set).not.toHaveBeenCalled();
  });
});
