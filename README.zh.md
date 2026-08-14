# deepseek-harness-themes

[![ci](https://github.com/orxz/deepseek-harness-themes/actions/workflows/ci.yml/badge.svg)](https://github.com/orxz/deepseek-harness-themes/actions/workflows/ci.yml)
[![core](https://img.shields.io/npm/v/%40deepseek-harness-themes%2Fcore?label=core)](https://www.npmjs.com/package/@dsh-themes/core)
[![ui](https://img.shields.io/npm/v/%40deepseek-harness-themes%2Fui?label=ui)](https://www.npmjs.com/package/@dsh-themes/ui)

面向 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的 UI 主题集合。

> One harness. Multiple styles.

社区维护的主题集合，基于官方主题扩展点（`@deepseek-ai/dsh-client-ui-theme` 的 `ctx.theme`）构建。只关注视觉体验——颜色、表面、状态、代码块、工具调用、终端 UI。不改模型、不改 agent、不改提示词、不改协议。

## 包结构

| 包                                               | 职责                                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [`@dsh-themes/core`](packages/core/README.zh.md) | 六个 `ThemeDefinition`、`REQUIRED_TOKENS` 契约与 `registerThemes(registry)`；零 UI |
| [`@dsh-themes/ui`](packages/ui/README.zh.md)     | 客户端插件：注册全部主题、在设置页 General 区添加主题选择行、持久化第三方选择      |

## 主题

| 主题        | 基座                       |
| ----------- | -------------------------- |
| DeepSeek    | 浅色——清爽的 DeepSeek 蓝   |
| OLED        | 深色——真黑，适配 OLED 屏幕 |
| Dracula     | 深色——高对比紫/靛蓝        |
| Catppuccin  | 深色——柔和马卡龙（Mocha）  |
| Tokyo Night | 深色——午夜蓝 + 霓虹点缀    |
| GitHub Dark | 深色——熟悉的 GitHub 界面   |

## 安装

一条命令完成依赖安装、profile 层添加与功能挂载：

```sh
dsh plugin --profile <profile> add @dsh-themes/ui
```

卸载同样简单：

```sh
dsh plugin --profile <profile> remove @dsh-themes/ui
```

仅用核心包、手写 patch 替代方式与本地开发见 [docs/installation.md](docs/installation.md)。

## 主题理念

主题改变 deepseek-harness 的外观，而非行为。一个主题应当：易于安装、易于切换、易于定制、跨 UI 状态一致、适合长时间编码、与 agent 逻辑解耦。token 契约见 [docs/theme-spec.md](docs/theme-spec.md)。

## 贡献

欢迎社区主题——[docs/creating-a-theme.md](docs/creating-a-theme.md) 是分步指南。常驻命令见 [AGENTS.md](AGENTS.md)。

参与须遵守[行为准则](CODE_OF_CONDUCT.md)。安全问题请按[安全策略](SECURITY.md)私下上报。

## License

MIT
