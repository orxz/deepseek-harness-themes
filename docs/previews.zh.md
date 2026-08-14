# 主题预览

[English](previews.md) | [简体中文](previews.zh.md)

每张预览都由该主题自己的 token 字典生成 —— 侧边栏、消息气泡、代码块、工具调用与输入框，用的都是 harness 实际会应用的取值。它是 `packages/core/src/themes` 的投影而非截图，因此不可能与随包内容不一致。`pnpm previews` 重新生成全部文件，`pnpm test` 会在已提交的预览过期时失败。每张投影之下是同一主题挂载到真实 harness Web 界面后的截图：投影回答「有哪些颜色」，截图展示「装上之后长什么样」。

安装选择器即可随意切换：[安装指南](installation.zh.md)。

## DeepSeek

浅色——清爽的 DeepSeek 蓝。底色 `#ffffff`，主色 `#4176e6`。

![DeepSeek 主题预览](../previews/deepseek.svg)

![DeepSeek 在 harness 中的实际效果](../screenshots/deepseek.png)

## OLED

深色——真黑，适配 OLED 屏幕，不亮的像素保持不亮。底色 `#000000`，主色 `#ffffff`。

![OLED 主题预览](../previews/oled.svg)

![OLED 在 harness 中的实际效果](../screenshots/oled.png)

## Dracula

深色——高对比紫，衬在近黑靛蓝之上。底色 `#282a36`，主色 `#bd93f9`。

![Dracula 主题预览](../previews/dracula.svg)

![Dracula 在 harness 中的实际效果](../screenshots/dracula.png)

## Catppuccin

深色——柔和马卡龙（Mocha），低饱和藕荷点缀。底色 `#1e1e2e`，主色 `#cba6f7`。

![Catppuccin 主题预览](../previews/catppuccin.svg)

![Catppuccin 在 harness 中的实际效果](../screenshots/catppuccin.png)

## Tokyo Night

深色——午夜蓝 + 霓虹点缀。底色 `#1a1b26`，主色 `#7aa2f7`。

![Tokyo Night 主题预览](../previews/tokyo-night.svg)

![Tokyo Night 在 harness 中的实际效果](../screenshots/tokyo-night.png)

## GitHub Dark

深色——熟悉的 GitHub 界面。底色 `#0d1117`，主色 `#58a6ff`。

![GitHub Dark 主题预览](../previews/github-dark.svg)

![GitHub Dark 在 harness 中的实际效果](../screenshots/github-dark.png)

## 新增主题

新主题的预览是生成的，不靠手绘：步骤见[创建主题](creating-a-theme.zh.md)。上面引用的两个颜色是 `--dsw-alias-bg-base` 与 `--dsw-alias-brand-primary`，与设置行色卡取的是同一对。
