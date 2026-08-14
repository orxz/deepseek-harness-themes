import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  validateClientBundle,
  validateClientHostImports,
  validatePackageDirectory,
} from "../../../build/package-smoke.ts";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) =>
      rm(root, {
        force: true,
        recursive: true,
      }),
    ),
  );
});

describe("packed package validation", () => {
  it("accepts a package whose public exports and plugin patch are shipped", async () => {
    const root = await createPackageFixture();

    await expect(validatePackageDirectory(root)).resolves.toBeUndefined();
  });

  it("rejects an export target omitted from the installed package", async () => {
    const root = await createPackageFixture({ omittedFile: "lib/client.js" });

    await expect(validatePackageDirectory(root)).rejects.toThrow(
      "@fixture/theme: missing export target ./lib/client.js",
    );
  });

  it("rejects a package without the public client subpath", async () => {
    const root = await createPackageFixture({ omitClientExport: true });

    await expect(validatePackageDirectory(root)).rejects.toThrow(
      "@fixture/theme: missing public export ./client",
    );
  });

  it("rejects a package published without its license", async () => {
    const root = await createPackageFixture({ omittedFile: "LICENSE" });

    await expect(validatePackageDirectory(root)).rejects.toThrow(
      "@fixture/theme: missing required file ./LICENSE",
    );
  });

  it("rejects a package published without the translated readme", async () => {
    const root = await createPackageFixture({ omittedFile: "README.zh.md" });

    await expect(validatePackageDirectory(root)).rejects.toThrow(
      "@fixture/theme: missing required file ./README.zh.md",
    );
  });

  it("rejects a root export pointed at the client bundle", async () => {
    const root = await createPackageFixture({
      rootDefault: "./lib/client.js",
    });

    await expect(validatePackageDirectory(root)).rejects.toThrow(
      "@fixture/theme: public export . default must target ./lib/index.js",
    );
  });
});

describe("client bundle validation", () => {
  it("accepts bundles that leave every direct host runtime external", () => {
    expect(() =>
      validateClientHostImports(`
        require("@deepseek-ai/dsh-client-runtime/client");
        require("react/jsx-runtime");
      `),
    ).not.toThrow();
  });

  it("serves platform seeds and the plugins the package injects", () => {
    // `dsh-client-runtime/client` is not a seed word: the loader resolves it
    // because the package injects that plugin, so the injected list has to be
    // part of the judgement rather than a hard-coded allowance.
    expect(() =>
      validateClientBundle(
        `
        require("react/jsx-runtime");
        require("@deepseek-ai/dsh-client-ui-primitives");
        require("@deepseek-ai/dsh-client-runtime/client");
      `,
        ["@deepseek-ai/dsh-client-runtime"],
      ),
    ).not.toThrow();
  });

  it("rejects a bundle that requires a module the shell never serves", () => {
    // The settings schema library exists in Node but is not seeded into the
    // browser table, and requiring it fails the whole plugin load.
    expect(() =>
      validateClientBundle(
        `
        require("@deepseek-ai/dsh-client-runtime/client");
        require("@deepseek-ai/schemastery");
      `,
        ["@deepseek-ai/dsh-client-runtime"],
      ),
    ).toThrow(
      "client bundle requires @deepseek-ai/schemastery, which the browser module table does not serve",
    );
  });

  it("rejects a bundle whose host runtime resolves through no injection", () => {
    expect(() =>
      validateClientBundle(
        `require("@deepseek-ai/dsh-client-runtime/client");`,
      ),
    ).toThrow(
      "client bundle requires @deepseek-ai/dsh-client-runtime/client, which the browser module table does not serve",
    );
  });

  it("rejects a bundle that embeds a direct host runtime", () => {
    expect(() =>
      validateClientHostImports("export const bakedActions = {};"),
    ).toThrow("client bundle embeds @deepseek-ai/dsh-client-runtime/client");
  });
});

interface PackageFixtureOptions {
  omitClientExport?: boolean;
  omittedFile?: string;
  rootDefault?: string;
}

async function createPackageFixture(
  options: PackageFixtureOptions = {},
): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "dsh-package-fixture-"));
  temporaryRoots.push(root);
  await mkdir(join(root, "lib"));
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({
      name: "@fixture/theme",
      files: ["lib", "cordis.patch.yml"],
      exports: {
        ".": {
          types: "./lib/index.d.ts",
          default: options.rootDefault ?? "./lib/index.js",
        },
        ...(options.omitClientExport
          ? {}
          : {
              "./client": {
                types: "./lib/client.d.ts",
                default: "./lib/client.js",
              },
            }),
        "./package.json": "./package.json",
      },
    }),
  );

  const files = [
    "LICENSE",
    "README.zh.md",
    "cordis.patch.yml",
    "lib/index.js",
    "lib/index.d.ts",
    "lib/client.js",
    "lib/client.d.ts",
  ];
  await Promise.all(
    files
      .filter((file) => file !== options.omittedFile)
      .map((file) => writeFile(join(root, file), "export {};\n")),
  );
  return root;
}
