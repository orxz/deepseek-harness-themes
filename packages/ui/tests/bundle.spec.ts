import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** The published bundle manifest: patch declaration plus the shipped layer. */
function readPackageFile(name: string): string {
  const root = fileURLToPath(new URL("..", import.meta.url));
  return readFileSync(new URL(name, `file://${root}/`), "utf8");
}

describe("bundle manifest", () => {
  it("declares the dsh.bundle patch in package.json", () => {
    const manifest = JSON.parse(readPackageFile("package.json")) as {
      dsh?: { bundle?: { patch?: string } };
      devDependencies?: Record<string, string>;
      dependencies?: Record<string, string>;
      files?: string[];
      peerDependencies?: Record<string, string>;
      peerDependenciesMeta?: Record<string, { optional?: boolean }>;
    };

    expect(manifest.dsh?.bundle?.patch).toBe("./cordis.patch.yml");
    expect(manifest.files).toContain("cordis.patch.yml");
    expect(manifest.peerDependencies?.["@deepseek-ai/schemastery"]).toBe(
      "^3.18.1",
    );
    expect(manifest.peerDependencies?.["@deepseek-ai/dsh-client-runtime"]).toBe(
      "^0.0.1-rc.1",
    );
    expect(manifest.dependencies).not.toHaveProperty(
      "@deepseek-ai/schemastery",
    );
    expect(manifest.dependencies).not.toHaveProperty(
      "@deepseek-ai/dsh-client-runtime",
    );
    expect(manifest.devDependencies?.["@dshthemes/core"]).toBe("workspace:^");
  });

  it("asks the installing profile for none of its peers", () => {
    const manifest = JSON.parse(readPackageFile("package.json")) as {
      peerDependencies?: Record<string, string>;
      peerDependenciesMeta?: Record<string, { optional?: boolean }>;
    };

    // Every peer here is supplied by the dsh installation: host modules reach
    // the plugin through the loader's module table and the maintained
    // `$DSH_HOME/profiles/node_modules` fallback, and the core catalog is
    // inlined into the client bundle. A required peer would make pnpm demand
    // an install that is unnecessary at best — a second cordis instance, or a
    // core bundle row registering the same theme ids twice — so each one is
    // declared optional.
    for (const name of Object.keys(manifest.peerDependencies ?? {})) {
      expect(
        manifest.peerDependenciesMeta?.[name]?.optional,
        `${name} must be an optional peer`,
      ).toBe(true);
    }
  });

  it("ships the theme row in cordis.patch.yml", () => {
    const patch = readPackageFile("cordis.patch.yml");

    expect(patch).toContain("id: dsh-themes");
    expect(patch).toContain('name: "@dshthemes/ui"');
  });
});
