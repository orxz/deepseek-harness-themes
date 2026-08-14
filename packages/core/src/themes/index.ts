import type { ThemeDefinition } from "../types.ts";
import { catppuccin } from "./catppuccin.ts";
import { deepseek } from "./deepseek.ts";
import { dracula } from "./dracula.ts";
import { githubDark } from "./github-dark.ts";
import { midnight } from "./midnight.ts";
import { minimal } from "./minimal.ts";
import { monokai } from "./monokai.ts";
import { nord } from "./nord.ts";
import { oled } from "./oled.ts";
import { tokyoNight } from "./tokyo-night.ts";

export {
  catppuccin,
  deepseek,
  dracula,
  githubDark,
  midnight,
  minimal,
  monokai,
  nord,
  oled,
  tokyoNight,
};

/** All shipped themes in catalog order. */
export const themes: readonly ThemeDefinition[] = Object.freeze([
  deepseek,
  midnight,
  oled,
  nord,
  dracula,
  catppuccin,
  tokyoNight,
  githubDark,
  monokai,
  minimal,
]);
