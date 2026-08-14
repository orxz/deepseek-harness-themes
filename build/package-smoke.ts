import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const PACKAGES = [
  "@deepseek-harness-themes/core",
  "@deepseek-harness-themes/ui",
] as const;

const REQUIRED_PACKAGE_FILES = [
  "cordis.patch.yml",
  "lib/index.js",
  "lib/index.d.ts",
  "lib/client.js",
  "lib/client.d.ts",
] as const;

interface PackageManifest {
  exports?: unknown;
  files?: unknown;
  name?: unknown;
}

/** Validate the public surface of one installed package directory. */
export async function validatePackageDirectory(
  packageRoot: string,
): Promise<void> {
  const manifestPath = join(packageRoot, "package.json");
  const manifest = JSON.parse(
    await readFile(manifestPath, "utf8"),
  ) as PackageManifest;
  if (typeof manifest.name !== "string" || manifest.name.length === 0) {
    throw new Error(`${manifestPath}: missing package name`);
  }
  const packageName = manifest.name;
  if (!Array.isArray(manifest.files)) {
    throw new Error(`${packageName}: missing files allow-list`);
  }
  if (manifest.exports === undefined) {
    throw new Error(`${packageName}: missing exports map`);
  }

  for (const target of collectExportTargets(manifest.exports)) {
    if (!existsSync(join(packageRoot, target.slice(2)))) {
      throw new Error(`${packageName}: missing export target ${target}`);
    }
  }
  for (const requiredFile of REQUIRED_PACKAGE_FILES) {
    if (!existsSync(join(packageRoot, requiredFile))) {
      throw new Error(
        `${packageName}: missing required file ./${requiredFile}`,
      );
    }
  }
}

/** Pack both workspaces, install them as a consumer, and verify public use. */
export async function runPackageSmoke(
  workspaceRoot = process.cwd(),
): Promise<void> {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "dsh-package-smoke-"));
  const packsDirectory = join(temporaryRoot, "packs");
  const consumerDirectory = join(temporaryRoot, "consumer");
  try {
    await mkdir(packsDirectory);
    await mkdir(consumerDirectory);
    for (const packageName of PACKAGES) {
      run(
        "pnpm",
        ["--filter", packageName, "pack", "--pack-destination", packsDirectory],
        workspaceRoot,
      );
    }

    const tarballs = (await readdir(packsDirectory))
      .filter((file) => file.endsWith(".tgz"))
      .sort()
      .map((file) => join(packsDirectory, file));
    if (tarballs.length !== PACKAGES.length) {
      throw new Error(
        `expected ${PACKAGES.length} package tarballs, found ${tarballs.length}`,
      );
    }

    await writeFile(
      join(consumerDirectory, "package.json"),
      `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`,
    );
    const localClsx = join(
      workspaceRoot,
      "packages",
      "ui",
      "node_modules",
      "clsx",
    );
    await writeFile(
      join(consumerDirectory, "pnpm-workspace.yaml"),
      [
        'packages: ["."]',
        "overrides:",
        `  clsx: ${JSON.stringify(`link:${localClsx}`)}`,
        "peerDependencyRules:",
        "  ignoreMissing:",
        '    - "@deepseek-ai/*"',
        '    - "react"',
        "",
      ].join("\n"),
    );
    run(
      "pnpm",
      [
        "add",
        "--offline",
        "--ignore-scripts",
        "--config.auto-install-peers=false",
        "--config.strict-peer-dependencies=false",
        ...tarballs,
      ],
      consumerDirectory,
    );

    for (const packageName of PACKAGES) {
      await validatePackageDirectory(
        join(consumerDirectory, "node_modules", ...packageName.split("/")),
      );
    }
    const coreEntry = join(
      consumerDirectory,
      "node_modules",
      "@deepseek-harness-themes",
      "core",
      "lib",
      "index.js",
    );
    const core = (await import(pathToFileURL(coreEntry).href)) as {
      themes?: unknown;
    };
    if (!Array.isArray(core.themes) || core.themes.length !== 10) {
      throw new Error("installed core package did not expose ten themes");
    }

    console.log(
      `Package smoke passed: ${tarballs.map((file) => basename(file)).join(", ")}`,
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

/** Collect relative file targets from nested conditional export maps. */
function collectExportTargets(value: unknown): string[] {
  if (typeof value === "string") {
    return value.startsWith("./") ? [value] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectExportTargets);
  }
  if (value !== null && typeof value === "object") {
    return Object.values(value).flatMap(collectExportTargets);
  }
  return [];
}

/** Run one package-manager command and preserve its output on failure. */
function run(command: string, args: string[], cwd: string): void {
  const packageManager = process.env.npm_execpath;
  let executable = command;
  let commandArgs = args;
  if (command === "pnpm") {
    if (packageManager === undefined) {
      throw new Error("package smoke must run through pnpm");
    }
    executable = process.execPath;
    commandArgs = [packageManager, ...args];
  }
  const result = spawnSync(executable, commandArgs, {
    cwd,
    stdio: "inherit",
  });
  if (result.error !== undefined) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited ${result.status}`);
  }
}

const entry = process.argv[1];
if (
  entry !== undefined &&
  import.meta.url === pathToFileURL(resolve(entry)).href
) {
  await runPackageSmoke();
}
