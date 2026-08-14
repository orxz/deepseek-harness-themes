# deepseek-harness-themes

[English](README.md) | [简体中文](README.zh.md)

[![ci](https://github.com/orxz/deepseek-harness-themes/actions/workflows/ci.yml/badge.svg)](https://github.com/orxz/deepseek-harness-themes/actions/workflows/ci.yml)
[![core](https://img.shields.io/npm/v/%40dshthemes%2Fcore?label=core)](https://www.npmjs.com/package/@dshthemes/core)
[![ui](https://img.shields.io/npm/v/%40dshthemes%2Fui?label=ui)](https://www.npmjs.com/package/@dshthemes/ui)

A collection of UI themes for [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness).

> One harness. Multiple styles.

Community-maintained theme collection built on the official theme extension point (`ctx.theme` from `@deepseek-ai/dsh-client-ui-theme`). It focuses only on the visual experience — colors, surfaces, states, code blocks, tool calls, terminal UI. No model changes, no agent changes, no prompt changes, no protocol changes.

## Packages

| Package                                      | Role                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [`@dshthemes/core`](packages/core/README.md) | Six `ThemeDefinition`s, the `REQUIRED_TOKENS` contract, and `registerThemes(registry)`; zero UI                    |
| [`@dshthemes/ui`](packages/ui/README.md)     | Client plugin: registers all themes, adds a Theme picker row to Settings → General, persists third-party selection |

## Themes

Every preview is generated from that theme's own tokens; the full gallery is [docs/previews.md](docs/previews.md).

| Theme       | Base                                   | Preview                                                                          |
| ----------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| DeepSeek    | light — clean DeepSeek-inspired blue   | <img src="previews/deepseek.svg" alt="DeepSeek theme preview" width="220">       |
| OLED        | dark — true black for emissive panels  | <img src="previews/oled.svg" alt="OLED theme preview" width="220">               |
| Dracula     | dark — high-contrast purple/indigo     | <img src="previews/dracula.svg" alt="Dracula theme preview" width="220">         |
| Catppuccin  | dark — soft pastel (Mocha)             | <img src="previews/catppuccin.svg" alt="Catppuccin theme preview" width="220">   |
| Tokyo Night | dark — midnight blue with neon accents | <img src="previews/tokyo-night.svg" alt="Tokyo Night theme preview" width="220"> |
| GitHub Dark | dark — familiar GitHub interface       | <img src="previews/github-dark.svg" alt="GitHub Dark theme preview" width="220"> |

## Install

Two commands: one installs the dependency, adds the layer to the profile, and mounts the feature; the other starts the Web surface.

```sh
dsh plugin --profile web add @dshthemes/ui
dsh web
```

`web` is the shipped Web profile and initializes on first use. Pick a theme under Settings → General; the selection persists, so nothing else runs from a terminal.

<img src="screenshots/settings.png" alt="The Theme picker row under Settings → General" width="480">

Remove it just as easily:

```sh
dsh plugin --profile web remove @dshthemes/ui
```

See [docs/installation.md](docs/installation.md) for the core-only shape, installing from a source checkout, the hand-written patch alternative, local development, and troubleshooting.

## Theme philosophy

Themes change how deepseek-harness looks, not how it behaves. A theme is easy to install, easy to switch, easy to customize, consistent across UI states, comfortable during long coding sessions, and independent from agent logic. The token contract is [docs/theme-spec.md](docs/theme-spec.md).

## Contributing

Community themes are welcome — [docs/creating-a-theme.md](docs/creating-a-theme.md) is the ordered guide. Standing orders live in [AGENTS.md](AGENTS.md).

Participation follows the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately through the [security policy](SECURITY.md).

## License

MIT
