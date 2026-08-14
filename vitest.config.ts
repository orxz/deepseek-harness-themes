import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ["tsconfig.base.json"] })],
  resolve: {
    alias: {
      "@deepseek-ai/dsh-client-runtime/client": resolve(
        root,
        "build/dsh-types/runtime-client.test.ts",
      ),
    },
  },
  test: {
    globals: true,
    include: ["packages/*/tests/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "istanbul",
      include: ["packages/*/src/**/*.{ts,tsx}"],
      thresholds: {
        perFile: true,
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
