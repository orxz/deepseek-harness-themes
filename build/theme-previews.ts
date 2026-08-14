/**
 * Preview generator: one SVG per shipped theme, painted from that theme's own
 * token dictionary. The composition mocks the surfaces a theme actually
 * changes — sidebar, message bubble, code block, tool row, composer — so the
 * file stays a projection of `packages/core/src/themes`, never a hand-drawn
 * asset that can disagree with it. `pnpm test` fails when a committed preview
 * drifts from what this module renders.
 * @module build/theme-previews
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { themes } from "../packages/core/src/themes/index.ts";
import type { ThemeDefinition } from "../packages/core/src/types.ts";

/** Directory holding the generated previews, relative to the repository root. */
export const PREVIEW_DIR = "previews";

/** Canvas the composition is laid out in. */
const WIDTH = 360;
const HEIGHT = 226;

/**
 * Tokens the composition paints with. Every entry is in `REQUIRED_TOKENS`, so
 * each shipped theme resolves all of them.
 */
export const PREVIEW_TOKENS = [
  "--dsw-alias-bg-base",
  "--dsw-alias-bg-layer-1",
  "--dsw-alias-bg-layer-2",
  "--dsw-alias-label-primary",
  "--dsw-alias-label-secondary",
  "--dsw-alias-label-tertiary",
  "--dsw-alias-brand-primary",
  "--dsw-alias-state-business-primary",
  "--dsw-alias-state-success-primary",
  "--dsw-alias-state-warn-primary",
  "--dsw-alias-border-l2",
  "--dsw-alias-button-primary-fill",
  "--dsw-alias-markdown-code-block",
  "--dsw-alias-markdown-code-block-banner",
  "--dsw-specific-bubble",
  "--dsw-specific-sidebar-fill",
  "--dsw-specific-sidebar-nav-item-active",
] as const;

/** The repository-root-relative path of one theme's preview. */
export function previewPath(id: string): string {
  return `${PREVIEW_DIR}/${id}.svg`;
}

/** One rounded rectangle of the mock. */
function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  radius = 0,
  stroke?: string,
): string {
  const corner = radius === 0 ? "" : ` rx="${radius}"`;
  // A theme whose surface equals its base (a white composer on a white page,
  // a near-black block on true black) is legitimate and common; the hairline
  // the real UI draws with this token is what keeps the mock readable there.
  const edge = stroke === undefined ? "" : ` stroke="${stroke}"`;
  return `    <rect x="${x}" y="${y}" width="${width}" height="${height}"${corner} fill="${fill}"${edge}/>`;
}

/**
 * Render one theme's preview.
 *
 * @param theme - the theme whose tokens paint the mock.
 * @returns the complete SVG document, newline-terminated.
 */
export function renderPreview(theme: ThemeDefinition): string {
  const color = (token: (typeof PREVIEW_TOKENS)[number]): string =>
    theme.tokens[token] as string;
  const body = [
    rect(0, 0, WIDTH, HEIGHT, color("--dsw-alias-bg-base")),
    // sidebar: brand mark, workspace title, one active nav row, three idle rows
    rect(0, 0, 105, HEIGHT, color("--dsw-specific-sidebar-fill")),
    rect(17, 16, 10, 10, color("--dsw-alias-brand-primary"), 3),
    rect(33, 19, 44, 5, color("--dsw-alias-label-secondary"), 2),
    rect(11, 44, 84, 18, color("--dsw-specific-sidebar-nav-item-active"), 6),
    rect(19, 50, 52, 5, color("--dsw-alias-label-primary"), 2),
    rect(19, 74, 60, 5, color("--dsw-alias-label-tertiary"), 2),
    rect(19, 94, 44, 5, color("--dsw-alias-label-tertiary"), 2),
    rect(19, 114, 52, 5, color("--dsw-alias-label-tertiary"), 2),
    // conversation: user bubble, then the assistant's answer
    rect(197, 20, 148, 26, color("--dsw-specific-bubble"), 9),
    rect(207, 27, 92, 4, color("--dsw-alias-label-secondary"), 2),
    rect(207, 36, 72, 4, color("--dsw-alias-label-tertiary"), 2),
    rect(121, 60, 180, 5, color("--dsw-alias-label-primary"), 2),
    rect(121, 72, 224, 5, color("--dsw-alias-label-secondary"), 2),
    // code block: banner strip over the block, then syntax runs
    rect(
      121,
      88,
      224,
      52,
      color("--dsw-alias-markdown-code-block"),
      7,
      color("--dsw-alias-border-l2"),
    ),
    rect(121, 88, 224, 12, color("--dsw-alias-markdown-code-block-banner"), 7),
    rect(121, 94, 224, 6, color("--dsw-alias-markdown-code-block-banner")),
    rect(131, 92, 26, 4, color("--dsw-alias-label-tertiary"), 2),
    rect(131, 108, 64, 4, color("--dsw-alias-state-business-primary"), 2),
    rect(203, 108, 48, 4, color("--dsw-alias-label-secondary"), 2),
    rect(131, 118, 92, 4, color("--dsw-alias-brand-primary"), 2),
    rect(131, 128, 58, 4, color("--dsw-alias-state-success-primary"), 2),
    // tool call: a settled call on the left, a pending one on the right
    rect(
      121,
      150,
      224,
      20,
      color("--dsw-alias-bg-layer-2"),
      7,
      color("--dsw-alias-border-l2"),
    ),
    rect(131, 157, 6, 6, color("--dsw-alias-state-success-primary"), 3),
    rect(143, 158, 90, 4, color("--dsw-alias-label-tertiary"), 2),
    rect(329, 157, 6, 6, color("--dsw-alias-state-warn-primary"), 3),
    // composer: placeholder and the primary send button
    rect(
      121,
      182,
      224,
      28,
      color("--dsw-alias-bg-layer-1"),
      10,
      color("--dsw-alias-border-l2"),
    ),
    rect(133, 194, 96, 5, color("--dsw-alias-label-tertiary"), 2),
    rect(309, 188, 26, 16, color("--dsw-alias-button-primary-fill"), 8),
  ].join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="${theme.id} theme preview">
  <!-- Generated by build/theme-previews.ts from packages/core/src/themes. Run: pnpm previews -->
  <defs>
    <clipPath id="window">
      <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="10"/>
    </clipPath>
  </defs>
  <g clip-path="url(#window)">
${body}
  </g>
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="10" fill="none" stroke="${color("--dsw-alias-border-l2")}"/>
</svg>
`;
}

/**
 * Write every catalog theme's preview under `root`.
 *
 * @param root - the repository root the preview directory hangs off.
 * @returns the repository-root-relative paths written, in catalog order.
 */
export async function writePreviews(root: string): Promise<string[]> {
  await mkdir(resolve(root, PREVIEW_DIR), { recursive: true });
  const written: string[] = [];
  for (const theme of themes) {
    const path = previewPath(theme.id);
    await writeFile(resolve(root, path), renderPreview(theme), "utf8");
    written.push(path);
  }
  return written;
}

const entry = process.argv[1];
if (
  entry !== undefined &&
  import.meta.url === pathToFileURL(resolve(entry)).href
) {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const written = await writePreviews(root);
  console.log(`Theme previews written: ${written.join(", ")}`);
}
