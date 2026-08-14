/** Dictionary keys of the picker settings row. */
export type PickerKey =
  | "picker.title"
  | "picker.light"
  | "picker.dark"
  | "picker.system"
  | "theme.deepseek"
  | "theme.oled"
  | "theme.dracula"
  | "theme.catppuccin"
  | "theme.tokyo-night"
  | "theme.github-dark"
  | "theme.solarized"
  | "theme.gruvbox"
  | "theme.nord";

export const en: Record<PickerKey, string> = {
  "picker.title": "Theme",
  "picker.light": "Light",
  "picker.dark": "Dark",
  "picker.system": "System",
  "theme.deepseek": "DeepSeek",
  "theme.oled": "OLED",
  "theme.dracula": "Dracula",
  "theme.catppuccin": "Catppuccin",
  "theme.tokyo-night": "Tokyo Night",
  "theme.github-dark": "GitHub Dark",
  "theme.solarized": "Solarized",
  "theme.gruvbox": "Gruvbox",
  "theme.nord": "Nord",
};

export const zh: Record<PickerKey, string> = {
  "picker.title": "主题",
  "picker.light": "浅色",
  "picker.dark": "深色",
  "picker.system": "跟随系统",
  "theme.deepseek": "DeepSeek",
  "theme.oled": "OLED",
  "theme.dracula": "德古拉",
  "theme.catppuccin": "卡布奇诺",
  "theme.tokyo-night": "东京之夜",
  "theme.github-dark": "GitHub 深色",
  "theme.solarized": "Solarized",
  "theme.gruvbox": "Gruvbox",
  "theme.nord": "Nord",
};
