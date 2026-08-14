import { describe, expect, it } from "vitest";
import {
  apply as clientApply,
  inject as clientInject,
  SETTINGS_NS as clientSettingsNs,
  type PickerClientContext as ClientPickerClientContext,
} from "../src/client.ts";

describe("client entry", () => {
  it("exports the browser plugin body directly", () => {
    expect(typeof clientApply).toBe("function");
    expect([...clientInject].sort()).toEqual([
      "locale",
      "settingsScope",
      "slots",
      "theme",
    ]);
    expect(clientSettingsNs).toBe("settings.dsh-themes");
  });

  it("types the client context structurally", () => {
    const context = null as unknown as ClientPickerClientContext;
    expect(context).toBeNull();
  });
});
