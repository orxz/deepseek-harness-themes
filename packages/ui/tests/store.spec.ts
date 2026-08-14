import { describe, expect, it } from "vitest";
import { createPickerStore } from "../src/store.ts";
import type { PickerStoreActions, PickerStoreState } from "../src/store.ts";
import type { BakedActions } from "@deepseek-ai/dsh-client-runtime/client";

const INITIAL: PickerStoreState = {
  preference: "system",
  activeId: "dark",
  themes: [],
  revision: -1,
};

const SNAPSHOT: PickerStoreState = {
  preference: "catppuccin",
  activeId: "catppuccin",
  themes: [{ id: "catppuccin", colorScheme: "dark" }],
  revision: 0,
};

describe("picker store", () => {
  it("declares a fresh initial state per instance", () => {
    const store = createPickerStore();
    const instance = store.create();

    expect(instance.getSnapshot()).toEqual(INITIAL);
  });

  it("bakes the sync action over the draft state", () => {
    const store = createPickerStore();
    const instance = store.create();

    instance.actions.sync(SNAPSHOT);

    expect(instance.getSnapshot()).toEqual(SNAPSHOT);
  });

  it("drops stale revisions in the sync action", () => {
    const store = createPickerStore();
    const instance = store.create();

    instance.actions.sync(SNAPSHOT);
    instance.actions.sync({ ...INITIAL, revision: -1 });

    expect(instance.getSnapshot()).toEqual(SNAPSHOT);
  });

  it("publishes changes through the subscription channel", () => {
    const store = createPickerStore();
    const instance = store.create();
    let notified = 0;
    instance.subscribe(() => {
      notified += 1;
    });

    instance.actions.sync(SNAPSHOT);

    expect(notified).toBe(1);
  });

  it("types the baked action surface", () => {
    const actions = null as unknown as BakedActions<
      PickerStoreState,
      PickerStoreActions
    >;
    expect(actions).toBeNull();
  });
});
