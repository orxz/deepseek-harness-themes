import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  PREVIEW_TOKENS,
  previewPath,
  renderPreview,
} from "../../../build/theme-previews.ts";
import { themes } from "../src/themes/index.ts";

const repositoryRoot = new URL("../../../", import.meta.url);

function readPreview(id: string): string {
  return readFileSync(new URL(previewPath(id), repositoryRoot), "utf8");
}

describe("theme previews", () => {
  it("ships a committed preview for every catalog theme", () => {
    for (const theme of themes) {
      expect(
        existsSync(new URL(previewPath(theme.id), repositoryRoot)),
        `${previewPath(theme.id)} is missing — run pnpm previews`,
      ).toBe(true);
    }
  });

  it("keeps every committed preview current with its theme", () => {
    for (const theme of themes) {
      expect(
        readPreview(theme.id),
        `${previewPath(theme.id)} is stale — run pnpm previews`,
      ).toBe(renderPreview(theme));
    }
  });

  it("paints each preview from that theme's own token values", () => {
    for (const theme of themes) {
      const preview = renderPreview(theme);

      for (const token of PREVIEW_TOKENS) {
        expect(preview, `${theme.id} preview drops ${token}`).toContain(
          theme.tokens[token] as string,
        );
      }
    }
  });

  it("quotes each theme's own identity colours in both gallery halves", () => {
    for (const guide of ["docs/previews.md", "docs/previews.zh.md"]) {
      const gallery = readFileSync(new URL(guide, repositoryRoot), "utf8");

      for (const theme of themes) {
        // The pair the settings-row swatch paints with, so the gallery and the
        // picker introduce a theme with the same two colours.
        for (const token of [
          "--dsw-alias-bg-base",
          "--dsw-alias-brand-primary",
        ] as const) {
          expect(gallery, `${guide} misquotes ${theme.id} ${token}`).toContain(
            theme.tokens[token] as string,
          );
        }
        expect(gallery).toContain(previewPath(theme.id));
      }
    }
  });

  it("names the generator so a hand edit is never the fix", () => {
    for (const theme of themes) {
      expect(readPreview(theme.id)).toContain("build/theme-previews.ts");
    }
  });

  it("ships a real capture for every theme and wires it into both galleries", () => {
    for (const guide of ["docs/previews.md", "docs/previews.zh.md"]) {
      const gallery = readFileSync(new URL(guide, repositoryRoot), "utf8");

      // The SVG answers "what colours" from the tokens; the PNG answers
      // "what the mounted harness actually looks like", and a capture that
      // exists but is unreferenced is dead weight rather than a gallery.
      for (const theme of themes) {
        const capture = `screenshots/${theme.id}.png`;
        expect(
          existsSync(new URL(capture, repositoryRoot)),
          `${capture} is missing`,
        ).toBe(true);
        expect(gallery, `${guide} drops the ${theme.id} capture`).toContain(
          capture,
        );
      }
    }
  });

  it("shows the mounted picker row beside every install promise", () => {
    // Every install guide lands the row under Settings → General; the
    // capture is the reader's proof, so it must stay wired in every
    // document that makes the promise.
    expect(
      existsSync(new URL("screenshots/settings.png", repositoryRoot)),
      "screenshots/settings.png is missing",
    ).toBe(true);
    for (const document of [
      "README.md",
      "README.zh.md",
      "docs/installation.md",
      "docs/installation.zh.md",
    ]) {
      expect(
        readFileSync(new URL(document, repositoryRoot), "utf8"),
        document,
      ).toContain("screenshots/settings.png");
    }
  });
});
