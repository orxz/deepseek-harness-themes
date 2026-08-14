import { describe, expect, it, vi } from "vitest";
import { apply, inject, type PickerHostContext } from "../src/index.ts";
import {
  THEME_PREFERENCE_SCHEMA,
  THEMES_NAMESPACE,
} from "../src/preference.ts";

/** Build a fake host context capturing the optional settings seam. */
function makeHostCtx(withSettings = true) {
  const register = vi.fn();
  const injected: Array<{ settings: { register: typeof register } }> = [];
  const inject = vi.fn(
    (
      deps: string[],
      callback: (ctx: { settings: { register: typeof register } }) => void,
    ) => {
      if (!withSettings) return;
      injected.push({ settings: { register } });
      callback({ settings: { register } });
    },
  );
  return { ctx: { inject } as PickerHostContext, inject, register };
}

describe("host registration", () => {
  it("declares the optional settings dependency", () => {
    expect([...inject]).toEqual(["settings"]);
  });

  it("registers the dsh-themes namespace schema when settings exist", () => {
    const { ctx, inject, register } = makeHostCtx();

    apply(ctx);

    expect(inject).toHaveBeenCalledWith(["settings"], expect.any(Function));
    expect(register).toHaveBeenCalledWith(
      THEMES_NAMESPACE,
      THEME_PREFERENCE_SCHEMA,
    );
  });

  it("skips registration when no settings service is composed", () => {
    const { ctx, register } = makeHostCtx(false);

    apply(ctx);

    expect(register).not.toHaveBeenCalled();
  });
});
