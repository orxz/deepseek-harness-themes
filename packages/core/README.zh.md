# `@dsh-themes/core`

面向 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的主题定义与注册辅助。本包零 UI、零 dsh 应用树运行时依赖：它以结构化方式对接官方主题扩展点（`@deepseek-ai/dsh-client-ui-theme` 的 `ctx.theme`）。

## 交付内容

- 六个主题定义（`ThemeDefinition = { id, colorScheme, tokens }`），每个都覆盖 `src/tokens.ts` 声明的完整 `REQUIRED_TOKENS` 与 `RECOMMENDED_TOKENS` 集合。
- `registerThemes(registry)` —— 注册全部随包主题，返回一个 disposer 可整体卸载。
- `/client` 插件入口（`apply`/`inject: ['theme']`），经带标签的 `ctx.effect` 注册全部主题，供不需要选择器的用户使用。

## 契约

- 主题 id 唯一；`light`、`dark`、`system` 为宿主保留 id，永不注册。
- `colorScheme`（`'light' | 'dark'`）选择宿主基座调色板；presenter 依据此字段切换 `body[data-ds-dark-theme]`。
- `tokens` 以内联 CSS 变量覆盖 `--dsw-alias-*` / `--dsw-specific-*` 语义层；宿主的 `--dsw-static-*` 静态色阶不属于本契约。
- 所有定义均冻结；导入后 token 字典不可变。

## 用法

独立安装（注册全部主题，无选择器）：

```sh
dsh plugin --profile <profile> add @dsh-themes/core
```

自定义组装可直接使用注册辅助函数：

```ts
import { registerThemes } from "@dsh-themes/core";

export function apply(ctx: ClientContext): void {
  ctx.effect(() => registerThemes(ctx.theme), "my-plugin: register themes");
}
```

主题选择由宿主负责：注册后调用 `ctx.theme.setTheme('catppuccin')`。第三方选择的持久化由配套插件 [`@dsh-themes/ui`](../ui/README.md) 提供。

## Model Experience

无——本包仅注册冻结的主题定义与注册辅助函数，没有任何内容进入模型请求。

#### KV Cache effect

无——本包不组装、也不发送任何提供方请求。

## 已知限制

- 宿主不校验覆盖集的完整性；本包以 `REQUIRED_TOKENS` + `pnpm test` 强制补足。
- 按宿主设计，经 `ctx.theme` 的主题选择是进程内状态；持久化边界见 `docs/theme-spec.md`。
