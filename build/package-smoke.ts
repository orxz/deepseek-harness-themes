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
import { PLATFORM_MODULES, SHELL_OWN_MODULES } from "./client-bundle.ts";

const PACKAGES = ["@dshthemes/core", "@dshthemes/ui"] as const;

const PUBLIC_SPECIFIERS = [
  "@dshthemes/core",
  "@dshthemes/core/client",
  "@dshthemes/ui",
  "@dshthemes/ui/client",
] as const;

const DIRECT_CLIENT_HOST_IMPORTS = [
  "@deepseek-ai/dsh-client-runtime/client",
] as const;

const REQUIRED_PACKAGE_FILES = [
  "LICENSE",
  "README.zh.md",
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
  validatePublicExport(packageName, manifest.exports, ".", "./lib/index.js");
  validatePublicExport(
    packageName,
    manifest.exports,
    "./client",
    "./lib/client.js",
  );

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

/**
 * Ensure every specifier a built client layer resolves is one the browser
 * module table serves it: a platform seed, a shell-own module, or a plugin
 * the package injects (the loader strips one `/client` suffix before looking
 * a plugin factory up).
 *
 * @param clientBundle - the built browser factory's source text.
 * @param injects - the package's `dsh.client.inject` list.
 */
export function validateClientBundle(
  clientBundle: string,
  injects: readonly string[] = [],
): void {
  const served = new Set<string>([
    ...PLATFORM_MODULES,
    ...SHELL_OWN_MODULES,
    ...injects.flatMap((plugin) => [plugin, `${plugin}/client`]),
  ]);
  for (const specifier of clientExternals(clientBundle)) {
    if (!served.has(specifier)) {
      throw new Error(
        `client bundle requires ${specifier}, which the browser module table does not serve`,
      );
    }
  }
}

/** Ensure the picker bundle still leaves its direct host runtimes external. */
export function validateClientHostImports(clientBundle: string): void {
  for (const specifier of DIRECT_CLIENT_HOST_IMPORTS) {
    const externalImportPatterns = [
      `require("${specifier}")`,
      `require('${specifier}')`,
      `from "${specifier}"`,
      `from '${specifier}'`,
    ];
    if (
      !externalImportPatterns.some((pattern) => clientBundle.includes(pattern))
    ) {
      throw new Error(`client bundle embeds ${specifier}`);
    }
  }
}

/**
 * Every static string-literal `require()` the built browser factory resolves
 * through the loader; template-literal or dynamic requires are outside this
 * scan.
 */
function clientExternals(clientBundle: string): Set<string> {
  const specifiers = new Set<string>();
  for (const match of clientBundle.matchAll(
    /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  )) {
    const specifier = match[1];
    if (specifier !== undefined) specifiers.add(specifier);
  }
  return specifiers;
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
    for (const packageName of PACKAGES) {
      const packageRoot = join(
        consumerDirectory,
        "node_modules",
        ...packageName.split("/"),
      );
      const manifest = JSON.parse(
        await readFile(join(packageRoot, "package.json"), "utf8"),
      ) as { dsh?: { client?: { inject?: string[] } } };
      const clientBundle = await readFile(
        join(packageRoot, "lib", "client.js"),
        "utf8",
      );
      validateClientBundle(clientBundle, manifest.dsh?.client?.inject ?? []);
      if (packageName === "@dshthemes/ui") {
        validateClientHostImports(clientBundle);
      }
    }
    verifyConsumerImports(consumerDirectory);

    console.log(
      `Package smoke passed: ${tarballs.map((file) => basename(file)).join(", ")}`,
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

/** Resolve every public entry and import the root package from the consumer. */
function verifyConsumerImports(consumerDirectory: string): void {
  const script = `
    const specifiers = ${JSON.stringify(PUBLIC_SPECIFIERS)};
    for (const specifier of specifiers) {
      const resolved = import.meta.resolve(specifier);
      if (!resolved.startsWith("file:")) {
        throw new Error(specifier + " resolved outside the installed package");
      }
    }
    const core = await import("@dshthemes/core");
    if (!Array.isArray(core.themes) || core.themes.length !== 6) {
      throw new Error("installed core package did not expose six themes");
    }
  `;
  run(
    process.execPath,
    ["--input-type=module", "--eval", script],
    consumerDirectory,
  );
}

/** Require one named conditional export to target its documented entry file. */
function validatePublicExport(
  packageName: string,
  exportsMap: unknown,
  exportName: string,
  expectedDefault: string,
): void {
  if (exportsMap === null || typeof exportsMap !== "object") {
    throw new Error(`${packageName}: missing public export ${exportName}`);
  }
  const publicExport = (exportsMap as Record<string, unknown>)[exportName];
  if (publicExport === undefined) {
    throw new Error(`${packageName}: missing public export ${exportName}`);
  }
  const defaultTarget =
    publicExport !== null && typeof publicExport === "object"
      ? (publicExport as Record<string, unknown>).default
      : publicExport;
  if (defaultTarget !== expectedDefault) {
    throw new Error(
      `${packageName}: public export ${exportName} default must target ${expectedDefault}`,
    );
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
