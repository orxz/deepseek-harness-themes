# `@deepseek-harness-themes/ui`

面向 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的主题选择器插件：注册全部 [`@deepseek-harness-themes/core`](../core/README.md) 主题、在设置页 General 区添加主题行、持久化第三方主题选择。

## 功能

- 经带标签的 `ctx.effect` 注册全部六个主题（卸载时一并撤销）。
- 绑定 `dsh-themes` 设置命名空间；激活时若持久化的第三方选择仍已注册则恢复。
- 每次 `theme/change` 持久化第三方选择；切回内置主题时清除标记（`system`），内置偏好仍归宿主 Appearance 行所有。
- 向 `settings.general.item` 槽位注入选择器行（id `themes`、order `11`，紧随宿主 Appearance 行）：内置三立方块 + 每个已注册主题一个条目。
- 附选择器文案的 en/zh 词典。

## 持久化边界

宿主内置主题 schema（`ui-theme.preference`）只接受 `light`/`dark`/`system`，因此本插件自建命名空间：

```yaml
# $DSH_HOME/settings.yaml
dsh-themes:
  theme: catppuccin
```

`system` 值表示"无覆盖——跟随宿主偏好"。恢复时忽略非字符串或未注册的值。

## 用法

一条命令完成依赖安装、profile 层添加与功能挂载（见 [docs/installation.md](../../docs/installation.md)）：

```sh
dsh plugin --profile <profile> add @deepseek-harness-themes/ui
```

本包随带 bundle manifest，`dsh plugin` 会将其自动追加进 `dsh.profile.bundles`。偏好手写层的 profile 也可以直接插入该行：

```yaml
- insert:
    - id: dsh-themes
      name: "@deepseek-harness-themes/ui"
```

浏览器花名册会自动扫描 `dsh.client` 插件，除 patch 条目外无需宿主侧配置。

## Model Experience

无——选择器仅管理浏览器偏好与设置行，没有任何内容进入模型请求。

#### KV Cache effect

无——本插件不组装、也不发送任何提供方请求。

## 已知限制

- 第三方选择的持久化存在于本插件自建命名空间，绝不写入宿主内置主题 schema。
- 按宿主设计，远程浏览器的选择保持进程本地（settings RPC 仅限 loopback）；见宿主 `SettingsScope` 契约。
- 选择器会列出宿主注册的全部第三方主题（含其他插件注册的），但随包词典只覆盖本包的六个 id；其他插件的主题以 id 的首字母大写形式显示，且不带色卡。
