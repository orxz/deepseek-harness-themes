import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validatePackageDirectory } from "../../../build/package-smoke.ts";

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
    const root = await createPackageFixture("lib/client.js");

    await expect(validatePackageDirectory(root)).rejects.toThrow(
      "@fixture/theme: missing export target ./lib/client.js",
    );
  });
});

async function createPackageFixture(omittedFile?: string): Promise<string> {
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
          default: "./lib/index.js",
        },
        "./client": {
          types: "./lib/client.d.ts",
          default: "./lib/client.js",
        },
        "./package.json": "./package.json",
      },
    }),
  );

  const files = [
    "cordis.patch.yml",
    "lib/index.js",
    "lib/index.d.ts",
    "lib/client.js",
    "lib/client.d.ts",
  ];
  await Promise.all(
    files
      .filter((file) => file !== omittedFile)
      .map((file) => writeFile(join(root, file), "export {};\n")),
  );
  return root;
}
