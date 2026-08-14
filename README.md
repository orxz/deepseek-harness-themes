# deepseek-harness-themes

[![ci](https://github.com/orxz/deepseek-harness-themes/actions/workflows/ci.yml/badge.svg)](https://github.com/orxz/deepseek-harness-themes/actions/workflows/ci.yml)
[![core](https://img.shields.io/npm/v/%40deepseek-harness-themes%2Fcore?label=core)](https://www.npmjs.com/package/@deepseek-harness-themes/core)
[![ui](https://img.shields.io/npm/v/%40deepseek-harness-themes%2Fui?label=ui)](https://www.npmjs.com/package/@deepseek-harness-themes/ui)

A collection of UI themes for [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness).

> One harness. Multiple styles.

Community-maintained theme collection built on the official theme extension point (`ctx.theme` from `@deepseek-ai/dsh-client-ui-theme`). It focuses only on the visual experience — colors, surfaces, states, code blocks, tool calls, terminal UI. No model changes, no agent changes, no prompt changes, no protocol changes.

## Packages

| Package                                                    | Role                                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [`@deepseek-harness-themes/core`](packages/core/README.md) | Ten `ThemeDefinition`s, the `REQUIRED_TOKENS` contract, and `registerThemes(registry)`; zero UI                    |
| [`@deepseek-harness-themes/ui`](packages/ui/README.md)     | Client plugin: registers all themes, adds a Theme picker row to Settings → General, persists third-party selection |

## Themes

| Theme       | Base                                      |
| ----------- | ----------------------------------------- |
| DeepSeek    | light — clean DeepSeek-inspired blue      |
| Midnight    | dark — low-contrast, long-session comfort |
| OLED        | dark — true black for emissive panels     |
| Nord        | dark — cool restrained Nordic palette     |
| Dracula     | dark — high-contrast purple/indigo        |
| Catppuccin  | dark — soft pastel (Mocha)                |
| Tokyo Night | dark — midnight blue with neon accents    |
| GitHub Dark | dark — familiar GitHub interface          |
| Monokai     | dark — classic developer palette          |
| Minimal     | light — low-color, distraction-free       |

## Install

One command installs the dependency, adds the layer to the profile, and mounts the feature:

```sh
dsh plugin --profile <profile> add @deepseek-harness-themes/ui
```

Remove it just as easily:

```sh
dsh plugin --profile <profile> remove @deepseek-harness-themes/ui
```

See [docs/installation.md](docs/installation.md) for the core-only shape, the hand-written patch alternative, and local development.

## Theme philosophy

Themes change how deepseek-harness looks, not how it behaves. A theme is easy to install, easy to switch, easy to customize, consistent across UI states, comfortable during long coding sessions, and independent from agent logic. The token contract is [docs/theme-spec.md](docs/theme-spec.md).

## Contributing

Community themes are welcome — [docs/creating-a-theme.md](docs/creating-a-theme.md) is the ordered guide. Standing orders live in [AGENTS.md](AGENTS.md).

Participation follows the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately through the [security policy](SECURITY.md).

## License

MIT
