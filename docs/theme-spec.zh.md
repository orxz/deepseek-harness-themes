# 主题规范

[English](theme-spec.md) | [简体中文](theme-spec.zh.md)

本仓库中每个主题遵循的 token 契约。权威清单位于 [`packages/core/src/tokens.ts`](../packages/core/src/tokens.ts)；本文档是它面向人类的镜像，两者必须在同一变更中保持同步。

## 主题的工作方式

一个主题就是一个 `ThemeDefinition`：

```ts
interface ThemeDefinition {
  id: string;
  colorScheme: "light" | "dark";
  tokens: Record<string, string>;
}
```

- `id` —— 主题身份。唯一；`light`、`dark`、`system` 为宿主保留。
- `colorScheme` —— 主题构建所用的宿主基座调色板。presenter 依据此字段切换 `body[data-ds-dark-theme]`，与 id 无关。深色主题声明 `'dark'`，其 token 即为深色值；浅色主题声明 `'light'`。
- `tokens` —— 以内联 CSS 变量覆盖 `--dsw-alias-*` / `--dsw-specific-*` 语义层。值是 CSS 颜色表达式（hex、`rgb()`/`rgba()`、`hsl()`/`hsla()`、或 `var()`）。

宿主的 `--dsw-static-*` 静态色阶归宿主样式表所有，不属于本契约。主题只覆盖语义层。

## 必需 token

每个主题必须提供以下全部（即 `packages/core/src/tokens.ts` 中的 `REQUIRED_TOKENS`）。缺失的 token 会回退到宿主基座调色板，破坏主题一致性，因此 `pnpm test` 强制覆盖。

| 分组       | Token                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景       | `--dsw-alias-bg-base`, `--dsw-alias-bg-layer-1`, `--dsw-alias-bg-layer-2`, `--dsw-alias-bg-layer-3`, `--dsw-alias-bg-overlay`                                               |
| 文字       | `--dsw-alias-label-primary`, `--dsw-alias-label-secondary`, `--dsw-alias-label-tertiary`                                                                                    |
| 品牌与状态 | `--dsw-alias-brand-primary`, `--dsw-alias-state-business-primary`, `--dsw-alias-state-success-primary`, `--dsw-alias-state-warn-primary`, `--dsw-alias-state-error-primary` |
| 边框       | `--dsw-alias-border-l1`, `--dsw-alias-border-l2`                                                                                                                            |
| 交互       | `--dsw-alias-interactive-bg-hover`, `--dsw-alias-interactive-bg-active`, `--dsw-alias-button-primary-fill`, `--dsw-alias-button-primary-hover`                              |
| 代码       | `--dsw-alias-markdown-code-block`, `--dsw-alias-markdown-code-block-banner`, `--dsw-alias-markdown-inline-code`, `--dsw-alias-markdown-tag`                                 |
| 滚动条     | `--dsw-alias-scrollbar-bg-l1`, `--dsw-alias-scrollbar-hover-l1`                                                                                                             |
| 表面       | `--dsw-alias-tooltip-bg`, `--dsw-specific-bubble`, `--dsw-specific-bubble-highlight`, `--dsw-specific-sidebar-fill`, `--dsw-specific-sidebar-nav-item-active`               |

## 推荐 token

`RECOMMENDED_TOKENS` 在必需集之外补充宿主别名词表的其余部分。随包主题覆盖全部；`pnpm test` 对推荐集执行同样的覆盖检查。

| 分组     | Token                                                                                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 遮罩     | `--dsw-alias-bg-mask-1`, `--dsw-alias-bg-mask-2`, `--dsw-alias-bg-mask-3`                                                                                                                                                      |
| 模块     | `--dsw-alias-bg-module-platform`, `--dsw-alias-bg-multi-select`, `--dsw-alias-bg-skeleton`                                                                                                                                     |
| 边框     | `--dsw-alias-border-l3`, `--dsw-alias-border-l4`, `--dsw-alias-border-inverted`                                                                                                                                                |
| 按钮     | `--dsw-alias-button-info-fill`, `--dsw-alias-button-info-hover`, `--dsw-alias-button-elevated-fill`, `--dsw-alias-button-floating-fill`, `--dsw-alias-button-floating-hover`                                                   |
| 交互     | `--dsw-alias-interactive-bg-hover-solid`, `--dsw-alias-interactive-bg-hover-danger`, `--dsw-alias-interactive-bg-hover-accent`                                                                                                 |
| 文字     | `--dsw-alias-label-caption`, `--dsw-alias-label-primary-inverted`, `--dsw-alias-label-primary-dimmed`, `--dsw-alias-label-dimmed`                                                                                              |
| Markdown | `--dsw-alias-markdown-citation`, `--dsw-alias-markdown-code-segment-selected`, `--dsw-alias-markdown-code-segment-unselected`, `--dsw-alias-markdown-placeholder`                                                              |
| 滚动条   | `--dsw-alias-scrollbar-bg-l2`, `--dsw-alias-scrollbar-hover-l2`                                                                                                                                                                |
| 状态     | `--dsw-alias-state-success-secondary`, `--dsw-alias-state-warn-secondary`, `--dsw-alias-state-error-secondary`, `--dsw-alias-state-success-tertiary`, `--dsw-alias-state-warn-tertiary`, `--dsw-alias-state-business-tertiary` |
| 表面     | `--dsw-alias-toast-bg`, `--dsw-specific-input-major`, `--dsw-specific-login-input`, `--dsw-specific-menu`, `--dsw-specific-selector`, `--dsw-specific-sidebar-nav-item-hover`, `--dsw-specific-tip`                            |

## 语义映射

项目 README 中面向主题的词表按如下方式映射到宿主 token：

| 概念                               | 宿主 token(s)                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| background                         | `--dsw-alias-bg-base`                                                                                      |
| foreground                         | `--dsw-alias-label-primary`                                                                                |
| muted                              | `--dsw-alias-label-secondary`, `--dsw-alias-label-tertiary`                                                |
| primary                            | `--dsw-alias-brand-primary`                                                                                |
| accent                             | `--dsw-alias-state-business-primary`                                                                       |
| success / warning / error          | `--dsw-alias-state-success-primary` / `--dsw-alias-state-warn-primary` / `--dsw-alias-state-error-primary` |
| info                               | `--dsw-alias-state-business-primary`                                                                       |
| user / assistant / thinking / tool | `--dsw-specific-bubble` / `--dsw-specific-bubble-highlight`（宿主没有按角色区分的别名）                    |
| code                               | `--dsw-alias-markdown-code-block`, `--dsw-alias-markdown-inline-code`, `--dsw-alias-markdown-tag`          |
| diff_add / diff_delete             | `--dsw-alias-state-success-primary` / `--dsw-alias-state-error-primary`（没有专门的 diff token）           |
| border                             | `--dsw-alias-border-l1`, `--dsw-alias-border-l2`                                                           |
| selection                          | 无专门宿主别名；主题可为 `--dsw-alias-interactive-bg-active` 着色                                          |
| statusbar                          | `--dsw-specific-sidebar-fill`                                                                              |

## 完整性

宿主不校验覆盖集是否完整。完整性由本仓库负责：`REQUIRED_TOKENS` 加测试套件（`packages/core/tests/themes.spec.ts`），对缺失 token、重复或保留 id、非法颜色值、未冻结定义直接失败。

## 对比度

每个主题都要在正文文字所处的六个表面上满足最低对比度：`bg-base`、`bg-layer-1`、`bg-layer-2`、`bubble`、`markdown-code-block` 与 `sidebar-fill`。

| Token 组                                | 比值    |
| --------------------------------------- | ------- |
| `label-primary`, `label-secondary`      | 4.5 : 1 |
| `label-tertiary`, `label-caption`       | 3 : 1   |
| `brand-primary`, 每个 `state-*-primary` | 3 : 1   |

`pnpm test` 通过 `packages/core/tests/contrast.spec.ts` 强制执行；配对与阈值位于 `packages/core/tests/contrast.ts`。

primary 与 secondary 文字承载正文，满足 WCAG AA。tertiary 与 caption 是弱化的元数据，保持 3:1，**低于** AA —— 这是保留这些主题所复刻的上游调色板的代价。调色板里有更亮的既有色就用它，不要发明颜色；没有时在主题文件的 JSDoc 中记录偏离。

反色表面不在范围内：`tooltip-bg` 与 `label-primary-inverted` 配对，不与普通文字梯度配对。

## 持久化边界

按宿主设计，第三方选择是进程本地的。选择器插件将其持久化到自己的设置命名空间：

```yaml
# $DSH_HOME/settings.yaml
dsh-themes:
  theme: catppuccin
```

宿主内置 schema（`ui-theme.preference`）只接受 `light`/`dark`/`system`，永不被第三方 id 写入。
