# @dshthemes/ui

## 0.1.0

### Minor Changes

- 649de73: Converge the catalog on six themes: DeepSeek, OLED, Dracula, Catppuccin, Tokyo Night, and GitHub Dark. Midnight, Minimal, Nord, and Monokai are removed. A persisted selection naming a removed theme is ignored on restore and the host preference applies instead.

### Patch Changes

- c145772: Rebuild the theme picker row as one radiogroup: each shipped theme now shows a colour swatch, arrow keys move the selection, the group holds a single tab stop, and hover and focus states use the host interaction tokens. Themes registered by other plugins render under a humanized id instead of a raw dictionary key.
- Updated dependencies [649de73]
- Updated dependencies [7784000]
  - @dshthemes/core@0.1.0

## 0.0.2

### Patch Changes

- 431961e: Externalize host-provided DeepSeek runtime modules, validate installed package artifacts, and automate fixed-group releases.
- b1ad961: Ship the MIT license and the translated README inside both published packages, and point package metadata at the project homepage and issue tracker.
- Updated dependencies [431961e]
- Updated dependencies [b1ad961]
  - @dshthemes/core@0.0.2
