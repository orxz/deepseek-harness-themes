# @dshthemes/core

## 0.1.0

### Minor Changes

- 649de73: Converge the catalog on six themes: DeepSeek, OLED, Dracula, Catppuccin, Tokyo Night, and GitHub Dark. Midnight, Minimal, Nord, and Monokai are removed. A persisted selection naming a removed theme is ignored on restore and the host preference applies instead.

### Patch Changes

- 7784000: Hold every theme to minimum contrast ratios and raise the colours that missed them. Tertiary text in Dracula, Tokyo Night, Catppuccin, GitHub Dark, OLED, and DeepSeek is lighter, and DeepSeek's success and warning colours now read on a white background. GitHub Dark, Catppuccin, and Tokyo Night adopt authentic lighter entries from their upstream palettes.

## 0.0.2

### Patch Changes

- 431961e: Externalize host-provided DeepSeek runtime modules, validate installed package artifacts, and automate fixed-group releases.
- b1ad961: Ship the MIT license and the translated README inside both published packages, and point package metadata at the project homepage and issue tracker.
