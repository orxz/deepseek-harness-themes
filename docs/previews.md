# Theme Previews

[English](previews.md) | [简体中文](previews.zh.md)

Each preview is generated from that theme's own token dictionary — sidebar, message bubble, code block, tool call, and composer, painted with the values the harness would apply. It is a projection of `packages/core/src/themes`, not a screenshot, so it can never disagree with what ships. `pnpm previews` regenerates every file and `pnpm test` fails when a committed preview drifts. Beneath each projection sits a capture of the same theme mounted in the real harness web surface: the projection answers from the tokens, the capture shows what installing actually buys.

Install the picker to switch between them at will: [installation](installation.md).

## DeepSeek

Light — clean DeepSeek-inspired blue. Base `#ffffff`, brand `#4176e6`.

![DeepSeek theme preview](../previews/deepseek.svg)

![DeepSeek applied in the harness](../screenshots/deepseek.png)

## OLED

Dark — true black for emissive panels, so unlit pixels stay unlit. Base `#000000`, brand `#ffffff`.

![OLED theme preview](../previews/oled.svg)

![OLED applied in the harness](../screenshots/oled.png)

## Dracula

Dark — high-contrast purple over near-black indigo. Base `#282a36`, brand `#bd93f9`.

![Dracula theme preview](../previews/dracula.svg)

![Dracula applied in the harness](../screenshots/dracula.png)

## Catppuccin

Dark — soft pastel (Mocha), muted mauve accents. Base `#1e1e2e`, brand `#cba6f7`.

![Catppuccin theme preview](../previews/catppuccin.svg)

![Catppuccin applied in the harness](../screenshots/catppuccin.png)

## Tokyo Night

Dark — midnight blue with neon accents. Base `#1a1b26`, brand `#7aa2f7`.

![Tokyo Night theme preview](../previews/tokyo-night.svg)

![Tokyo Night applied in the harness](../screenshots/tokyo-night.png)

## GitHub Dark

Dark — the familiar GitHub interface. Base `#0d1117`, brand `#58a6ff`.

![GitHub Dark theme preview](../previews/github-dark.svg)

![GitHub Dark applied in the harness](../screenshots/github-dark.png)

## Adding one

A new theme's preview is generated, never drawn: [creating a theme](creating-a-theme.md) covers the step. The two colours quoted above are `--dsw-alias-bg-base` and `--dsw-alias-brand-primary`, the same pair the settings-row swatch paints with.
