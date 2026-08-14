# @dshthemes/core

## 0.1.2

### Patch Changes

- fb04e84: Keep the settings schema out of the browser bundle so the picker loads. The durable schema is built with `@deepseek-ai/schemastery`, a host package the web shell does not seed into the browser plugin module table, and the client entry reached it through the shared preference module — so the loader rejected the whole plugin with "missed the module table" and no Theme row ever appeared. The schema now lives in a Node-only module, and the packaged client bundle is validated against the browser module table so a future host import fails the release instead of the page.
- fb04e84: Declare every peer dependency optional so installing into a profile is quiet and complete. The harness supplies cordis, schemastery, React, and the client runtime through its own module table, and the picker bundle inlines the theme catalog, so none of them belong in a profile's `node_modules`. pnpm previously reported them as missing peers and advised installing them — advice that is unnecessary for the host modules and actively wrong for `@dshthemes/core`, whose bundle row would register the same theme ids a second time and throw.

## 0.1.1

### Patch Changes

- 08b7726: Verify the OIDC trusted-publishing release pipeline end to end with a canary patch release.

## 0.1.0

### Minor Changes

- 649de73: Converge the catalog on six themes: DeepSeek, OLED, Dracula, Catppuccin, Tokyo Night, and GitHub Dark. Midnight, Minimal, Nord, and Monokai are removed. A persisted selection naming a removed theme is ignored on restore and the host preference applies instead.

### Patch Changes

- 7784000: Hold every theme to minimum contrast ratios and raise the colours that missed them. Tertiary text in Dracula, Tokyo Night, Catppuccin, GitHub Dark, OLED, and DeepSeek is lighter, and DeepSeek's success and warning colours now read on a white background. GitHub Dark, Catppuccin, and Tokyo Night adopt authentic lighter entries from their upstream palettes.

## 0.0.2

### Patch Changes

- 431961e: Externalize host-provided DeepSeek runtime modules, validate installed package artifacts, and automate fixed-group releases.
- b1ad961: Ship the MIT license and the translated README inside both published packages, and point package metadata at the project homepage and issue tracker.
