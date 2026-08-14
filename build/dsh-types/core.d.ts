/**
 * Build-time declaration shim for `@deepseek-harness-themes/core`, consumed
 * by the ui package's client-declaration emission (tsconfig paths). The
 * runtime bundle inlines the real core library; this file only names the
 * surface the picker imports, mirroring packages/core/src/index.ts.
 */

export interface ThemeDefinition {
  id: string;
  colorScheme: "light" | "dark";
  tokens: Record<string, string>;
}

export interface ThemeRegistry {
  register(definition: ThemeDefinition): () => void;
}

export declare function registerThemes(registry: ThemeRegistry): () => void;

export declare const themes: readonly ThemeDefinition[];
