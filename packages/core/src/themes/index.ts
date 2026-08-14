import type { ThemeDefinition } from "../types.ts";
import { catppuccin } from "./catppuccin.ts";
import { deepseek } from "./deepseek.ts";
import { dracula } from "./dracula.ts";
import { githubDark } from "./github-dark.ts";
import { oled } from "./oled.ts";
import { tokyoNight } from "./tokyo-night.ts";

export { catppuccin, deepseek, dracula, githubDark, oled, tokyoNight };

/** All shipped themes in catalog order. */
export const themes: readonly ThemeDefinition[] = Object.freeze([
  deepseek,
  oled,
  dracula,
  catppuccin,
  tokyoNight,
  githubDark,
]);
