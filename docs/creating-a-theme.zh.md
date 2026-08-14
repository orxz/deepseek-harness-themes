# 创建主题

[English](creating-a-theme.md) | [简体中文](creating-a-theme.zh.md)

一个主题 = 一个冻结的 `ThemeDefinition` 文件 + 一条目录登记。按以下步骤操作，测试套件会强制执行契约。

## 1. 阅读规范

[`docs/theme-spec.md`](theme-spec.zh.md) 定义了 token 契约。每个主题必须覆盖完整的 `REQUIRED_TOKENS` 与 `RECOMMENDED_TOKENS` 集合；`pnpm test` 对两者都强制执行。

## 2. 添加主题文件

创建 `packages/core/src/themes/<id>.ts`（kebab-case id）：

```ts
import type { ThemeDefinition } from '../types.ts'

/** 一行描述：调色板家族与气质。 */
export const <name>: ThemeDefinition = Object.freeze({
  id: '<id>',
  colorScheme: 'dark', // 或 'light' —— 宿主基座调色板
  tokens: Object.freeze({
    '--dsw-alias-bg-base': '#101418',
    // ... 完整的 REQUIRED_TOKENS 与 RECOMMENDED_TOKENS 集合
  }),
})
```

规则：

- id 唯一，且永不使用 `light`、`dark`、`system`。
- `colorScheme` 声明主题构建所用的宿主基座调色板；深色主题选 `'dark'`，其 token 即为深色值。
- token 值只能是 CSS 颜色表达式（hex、`rgb()`/`rgba()`、`hsl()`/`hsla()`、`var()`）。
- 定义对象与 token 字典都要冻结。

## 3. 注册主题

把它加进 `packages/core/src/themes/index.ts`（命名导出 + 目录数组）。目录顺序即注册顺序。

## 4. 添加选择器文案

在 `packages/ui/src/locales.ts` 的两个词典中，把主题名加入 `theme.<id>`（以及 `PickerKey` 联合类型）。

## 5. 验证

```sh
pnpm test          # id 唯一性、token 覆盖、颜色合法性、冻结、对比度门槛
pnpm typecheck
pnpm test:coverage # 逐文件 100% 覆盖门槛
```

对比度失败信息会列出 token、表面与实际比值。优先从你复刻的调色板中选更亮的既有色，而不是发明新色；调色板确实没有时，在主题文件的 JSDoc 中注明。门槛见
[theme-spec.md](theme-spec.zh.md#对比度)。

## 6. 预览

安装插件后运行 harness Web 开发组合（见[安装指南](installation.zh.md)），截图保存到 `screenshots/<id>.png`。
