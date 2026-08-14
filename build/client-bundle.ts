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
import type { UserConfig } from "tsdown";
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
 * @param externals - extra module-table specifiers beyond the platform
 *   modules (e.g. the sibling core package).
 */
export function clientBundle(
  id: string,
  libEntry: string,
  clientEntry: string,
  externals: readonly string[] = [],
): UserConfig[] {
  return [libConfig(id, libEntry), clientConfig(id, clientEntry, externals)];
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
  externals: readonly string[],
): UserConfig {
  const clientExternals = [...PLATFORM_MODULES, ...externals];
  return {
    name: `${id}/client`,
    entry: { client: entry },
    outDir: "lib",
    format: "cjs",
    platform: "browser",
    clean: false,
    external: [...clientExternals],
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
    // Bundle everything not in the module table; a require() the table
    // cannot answer is a guaranteed runtime throw.
    noExternal: (specifier: string) =>
      clientExternals.includes(specifier) ? undefined : true,
    plugins: [cssModulesPlugin(id)],
    outputOptions: {
      entryFileNames: "client.js",
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
      footer: "return module.exports; } });",
      intro: "var module = { exports: {} }; var exports = module.exports;",
    },
  };
}

/** Inline CSS Modules with lightningcss and inject a per-plugin style tag. */
function cssModulesPlugin(id: string) {
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
