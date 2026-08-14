import type { UserConfig } from "tsdown";
import { describe, expect, it } from "vitest";
import { clientBundle } from "../../../build/client-bundle.ts";

describe("client bundle dependency policy", () => {
  it("uses current tsdown dependency options", () => {
    const client = clientBundle(
      "example",
      "src/index.ts",
      "src/client.ts",
    )[1] as UserConfig;

    expect(client.external).toBeUndefined();
    expect(client.noExternal).toBeUndefined();
    expect(client.deps?.neverBundle).toBeDefined();
    expect(client.deps?.alwaysBundle).toBeTypeOf("function");
  });

  it("externalizes host modules and bundles only declared product dependencies", () => {
    const client = clientBundle("example", "src/index.ts", "src/client.ts", {
      bundledDependencies: ["@dsh-themes/core", "clsx"],
    })[1] as UserConfig;
    const alwaysBundle = client.deps?.alwaysBundle as (
      id: string,
      importer?: string,
    ) => boolean;

    expect(alwaysBundle("@deepseek-ai/schemastery")).toBe(false);
    expect(alwaysBundle("@deepseek-ai/dsh-client-runtime/client")).toBe(false);
    expect(alwaysBundle("react/jsx-runtime")).toBe(false);
    expect(alwaysBundle("clsx")).toBe(true);
    expect(alwaysBundle("@dsh-themes/core")).toBe(true);
    expect(alwaysBundle("unexpected-dependency")).toBe(false);
    expect(client.deps?.onlyBundle).toEqual(["@dsh-themes/core", "clsx"]);
  });
});
