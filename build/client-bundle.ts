/**
 * Shared tsdown preset for dsh client plugin bundles. Mirrors the host's
 * client bundle contract (deepseek-harness packages/client/tsdown.client.ts):
 * the bundle emits a closure-factory artifact that calls
 * `window.__ModuleLoader__.load({ id, factory })` and resolves externals
 * through the injected `require` (the loader module table). CSS Modules are
 * compiled by lightningcss inside the bundle: importing `x.module.css`
 * yields the hashed class map and the css text auto-injects a
 * `<style data-plugin="<id>">` tag at factory execution.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { TsdownPlugin, UserConfig } from "tsdown";
import { transform } from "lightningcss";

/** Platform modules shared into the frozen module table by the dsh web shell. */
export const PLATFORM_MODULES = [
  "react",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "@deepseek-ai/cordis",
  "@deepseek-ai/dsh-client-ui-slots",
  "@deepseek-ai/dsh-client-runtime/client",
] as const;

/** Any DeepSeek runtime module is supplied by the host module table. */
const HOST_MODULE = /^@deepseek-ai(?:\/|$)/;

/** Virtual-id prefix keeping module CSS away from tsdown's own css pipeline. */
const CSS_VIRTUAL_PREFIX = "\0dsh-css:";
const CSS_VIRTUAL_SUFFIX = ".mjs";

/**
 * Build the tsdown config for one client plugin package: the node-half lib
 * build (ESM) plus the browser client bundle (CJS factory).
 *
 * @param id - plugin id (package name), stamped into the handoff.
 * @param libEntry - node-half entry (the host face).
 * @param clientEntry - browser entry (the client face).
 * @param options - package-specific dependency boundary additions.
 */
export function clientBundle(
  id: string,
  libEntry: string,
  clientEntry: string,
  options: ClientBundleOptions = {},
): UserConfig[] {
  return [libConfig(id, libEntry), clientConfig(id, clientEntry, options)];
}

/** Dependency policy additions for one browser plugin bundle. */
export interface ClientBundleOptions {
  /** Extra module-table specifiers supplied by the host. */
  externals?: readonly string[];
  /** Product dependencies intentionally inlined into the plugin artifact. */
  bundledDependencies?: readonly string[];
}

/** Node-half library build: ESM output with declarations. */
function libConfig(id: string, entry: string): UserConfig {
  return {
    name: id,
    entry: { index: entry },
    outDir: "lib",
    format: ["esm"],
    fixedExtension: false,
    dts: true,
    clean: false,
  };
}

/** Browser bundle build: CJS factory handed to `window.__ModuleLoader__.load`. */
function clientConfig(
  id: string,
  entry: string,
  options: ClientBundleOptions,
): UserConfig {
  const clientExternals = [...PLATFORM_MODULES, ...(options.externals ?? [])];
  const bundledDependencies = options.bundledDependencies ?? [];
  return {
    name: `${id}/client`,
    entry: { client: entry },
    outDir: "lib",
    format: "cjs",
    platform: "browser",
    clean: false,
    deps: {
      neverBundle: [HOST_MODULE, ...clientExternals],
      alwaysBundle: (specifier: string) =>
        bundledDependencies.some((dependency) =>
          matchesModule(specifier, dependency),
        ) && !isClientExternal(specifier, clientExternals),
      onlyBundle: [...bundledDependencies],
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV ?? "production",
      ),
      "import.meta.env.MODE": JSON.stringify(
        process.env.NODE_ENV ?? "production",
      ),
      "import.meta.env": JSON.stringify({
        MODE: process.env.NODE_ENV ?? "production",
      }),
    },
    plugins: [cssModulesPlugin(id)],
    outputOptions: {
      entryFileNames: "client.js",
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
      footer: "return module.exports; } });",
      intro: "var module = { exports: {} }; var exports = module.exports;",
    },
  };
}

/** Match a package root and all of its subpath imports. */
function matchesModule(id: string, moduleId: string): boolean {
  return id === moduleId || id.startsWith(`${moduleId}/`);
}

/** Return whether the host module table owns one client import. */
function isClientExternal(id: string, externals: readonly string[]): boolean {
  return (
    HOST_MODULE.test(id) || externals.some((item) => matchesModule(id, item))
  );
}

/** Inline CSS Modules with lightningcss and inject a per-plugin style tag. */
function cssModulesPlugin(id: string): TsdownPlugin {
  return {
    name: "dsh-css-modules-inline",
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith(".module.css")) return null;
      const abs =
        importer !== undefined ? resolve(dirname(importer), source) : source;
      return CSS_VIRTUAL_PREFIX + abs + CSS_VIRTUAL_SUFFIX;
    },
    async load(virtualId: string) {
      if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null;
      const fileId = virtualId.slice(
        CSS_VIRTUAL_PREFIX.length,
        -CSS_VIRTUAL_SUFFIX.length,
      );
      if (!existsSync(fileId)) return null;
      this.addWatchFile(fileId);
      const source = await readFile(fileId);
      const { code, exports: cssExports } = transform({
        filename: fileId,
        code: source,
        cssModules: { pattern: "[hash]_[local]" },
        minify: true,
      });
      const classMap: Record<string, string> = {};
      for (const [local, exp] of Object.entries(cssExports ?? {})) {
        classMap[local] = exp.name;
      }
      return [
        `const css = ${JSON.stringify(code.toString())};`,
        `const tagId = ${JSON.stringify(`${id}/${fileId.split("/").pop()}`)};`,
        "if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {",
        "  const tag = document.createElement('style');",
        `  tag.dataset.plugin = ${JSON.stringify(id)};`,
        "  tag.dataset.pluginCss = tagId;",
        "  tag.textContent = css;",
        "  document.head.appendChild(tag);",
        "}",
        `export default ${JSON.stringify(classMap)};`,
      ].join("\n");
    },
  };
}
