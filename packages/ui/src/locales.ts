/** Dictionary keys of the picker settings row. */
export type PickerKey =
  | "picker.title"
  | "picker.light"
  | "picker.dark"
  | "picker.system"
  | "theme.deepseek"
  | "theme.midnight"
  | "theme.oled"
  | "theme.nord"
  | "theme.dracula"
  | "theme.catppuccin"
  | "theme.tokyo-night"
  | "theme.github-dark"
  | "theme.monokai"
  | "theme.minimal";

export const en: Record<PickerKey, string> = {
  "picker.title": "Theme",
  "picker.light": "Light",
  "picker.dark": "Dark",
  "picker.system": "System",
  "theme.deepseek": "DeepSeek",
  "theme.midnight": "Midnight",
  "theme.oled": "OLED",
  "theme.nord": "Nord",
  "theme.dracula": "Dracula",
  "theme.catppuccin": "Catppuccin",
  "theme.tokyo-night": "Tokyo Night",
  "theme.github-dark": "GitHub Dark",
  "theme.monokai": "Monokai",
  "theme.minimal": "Minimal",
};

export const zh: Record<PickerKey, string> = {
  "picker.title": "主题",
  "picker.light": "浅色",
  "picker.dark": "深色",
  "picker.system": "跟随系统",
  "theme.deepseek": "DeepSeek",
  "theme.midnight": "午夜",
  "theme.oled": "OLED",
  "theme.nord": "Nord",
  "theme.dracula": "德古拉",
  "theme.catppuccin": "卡布奇诺",
  "theme.tokyo-night": "东京之夜",
  "theme.github-dark": "GitHub 深色",
  "theme.monokai": "Monokai",
  "theme.minimal": "极简",
};
