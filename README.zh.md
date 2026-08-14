# deepseek-harness-themes

[English](README.md) | [简体中文](README.zh.md)

[![ci](https://github.com/orxz/deepseek-harness-themes/actions/workflows/ci.yml/badge.svg)](https://github.com/orxz/deepseek-harness-themes/actions/workflows/ci.yml)
[![core](https://img.shields.io/npm/v/%40dshthemes%2Fcore?label=core)](https://www.npmjs.com/package/@dshthemes/core)
[![ui](https://img.shields.io/npm/v/%40dshthemes%2Fui?label=ui)](https://www.npmjs.com/package/@dshthemes/ui)

面向 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的 UI 主题集合。

> One harness. Multiple styles.

社区维护的主题集合，基于官方主题扩展点（`@deepseek-ai/dsh-client-ui-theme` 的 `ctx.theme`）构建。只关注视觉体验——颜色、表面、状态、代码块、工具调用、终端 UI。不改模型、不改 agent、不改提示词、不改协议。

## 包结构

| 包                                              | 职责                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`@dshthemes/core`](packages/core/README.zh.md) | 六个 `ThemeDefinition`、`REQUIRED_TOKENS` 契约与 `registerThemes(registry)`；零 UI |
| [`@dshthemes/ui`](packages/ui/README.zh.md)     | 客户端插件：注册全部主题、在设置页 General 区添加主题选择行、持久化第三方选择      |

## 主题

每张预览都由该主题自己的 token 生成；完整画廊见[主题预览](docs/previews.zh.md)。

| 主题        | 基座                       | 预览                                                                        |
| ----------- | -------------------------- | --------------------------------------------------------------------------- |
| DeepSeek    | 浅色——清爽的 DeepSeek 蓝   | <img src="previews/deepseek.svg" alt="DeepSeek 主题预览" width="220">       |
| OLED        | 深色——真黑，适配 OLED 屏幕 | <img src="previews/oled.svg" alt="OLED 主题预览" width="220">               |
| Dracula     | 深色——高对比紫/靛蓝        | <img src="previews/dracula.svg" alt="Dracula 主题预览" width="220">         |
| Catppuccin  | 深色——柔和马卡龙（Mocha）  | <img src="previews/catppuccin.svg" alt="Catppuccin 主题预览" width="220">   |
| Tokyo Night | 深色——午夜蓝 + 霓虹点缀    | <img src="previews/tokyo-night.svg" alt="Tokyo Night 主题预览" width="220"> |
| GitHub Dark | 深色——熟悉的 GitHub 界面   | <img src="previews/github-dark.svg" alt="GitHub Dark 主题预览" width="220"> |

## 安装

两条命令：一条完成依赖安装、profile 层添加与功能挂载，另一条启动 Web 界面。

```sh
dsh plugin --profile web add @dshthemes/ui
dsh web
```

`web` 是随包的 Web profile，首次使用时自动初始化。在 设置 → General 里选主题即可，选择会持久化，之后不再需要终端。

<img src="screenshots/settings.png" alt="设置 → General 中的 Theme 选择行" width="480">

卸载同样简单：

```sh
dsh plugin --profile web remove @dshthemes/ui
```

仅用核心包、源码安装、手写 patch 替代方式、本地开发与故障排查见[安装指南](docs/installation.zh.md)。

## 主题理念

主题改变 deepseek-harness 的外观，而非行为。一个主题应当：易于安装、易于切换、易于定制、跨 UI 状态一致、适合长时间编码、与 agent 逻辑解耦。token 契约见[主题规范](docs/theme-spec.zh.md)。

## 贡献

欢迎社区主题——[创建主题](docs/creating-a-theme.zh.md)是分步指南。常驻命令见 [AGENTS.md](AGENTS.md)。

参与须遵守[行为准则](CODE_OF_CONDUCT.md)。安全问题请按[安全策略](SECURITY.md)私下上报。

## License

MIT
