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
      files?: string[];
    };

    expect(manifest.dsh?.bundle?.patch).toBe("./cordis.patch.yml");
    expect(manifest.files).toContain("cordis.patch.yml");
  });

  it("ships the theme row in cordis.patch.yml", () => {
    const patch = readPackageFile("cordis.patch.yml");

    expect(patch).toContain("id: dsh-themes");
    expect(patch).toContain('name: "@deepseek-harness-themes/ui"');
  });
});
