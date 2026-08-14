import type { ThemeDefinition } from "../types.ts";
import { catppuccin } from "./catppuccin.ts";
import { cobalt2 } from "./cobalt2.ts";
import { deepseek } from "./deepseek.ts";
import { dracula } from "./dracula.ts";
import { githubDark } from "./github-dark.ts";
import { gruvbox } from "./gruvbox.ts";
import { nord } from "./nord.ts";
import { oled } from "./oled.ts";
import { solarized } from "./solarized.ts";
import { synthwave84 } from "./synthwave-84.ts";
import { tokyoNight } from "./tokyo-night.ts";

export {
  catppuccin,
  cobalt2,
  deepseek,
  dracula,
  githubDark,
  gruvbox,
  nord,
  oled,
  solarized,
  synthwave84,
  tokyoNight,
};

/** All shipped themes in catalog order. */
export const themes: readonly ThemeDefinition[] = Object.freeze([
  deepseek,
  oled,
  dracula,
  catppuccin,
  tokyoNight,
  githubDark,
  solarized,
  gruvbox,
  nord,
  synthwave84,
  cobalt2,
]);
