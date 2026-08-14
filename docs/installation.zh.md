# 安装指南

[English](installation.md) | [简体中文](installation.zh.md)

两种安装形态：完整选择器插件（主题 + 设置行 + 持久化），或仅核心包（供自带选择 UI 的组合使用）。

## 前置条件

- 带有 Web 界面（`dsh-web-app` 组合）的 deepseek-harness，主题是浏览器客户端插件。
- 包可从 profile 的安装闭包中解析：dsh 会把 dsh 应用依赖闭包中的每个包软链到 `$DSH_HOME/profiles/node_modules`，因此包必须安装进 dsh 应用（自定义构建），或直接装进 profile 目录（`$DSH_HOME/profiles/<profile>/` —— 在该目录下运行 `pnpm add`）。

## 完整插件：`@dshthemes/ui`

本包随带 bundle manifest，一条命令完成依赖安装、profile bundle 列表的层添加与功能挂载：

```sh
dsh plugin --profile <profile> add @dshthemes/ui
```

无需手工编辑 `cordis.patch.yml` —— `dsh plugin` 会维护 profile manifest。卸载同样简单：

```sh
dsh plugin --profile <profile> remove @dshthemes/ui
```

偏好手写层的 profile 可以使用等价的 patch 行：

```yaml
# $DSH_HOME/profiles/<profile>/cordis.patch.yml
- insert:
    - id: dsh-themes
      name: "@dshthemes/ui"
```

选择器 bundle 已内联核心主题库，因此无需 core 行 —— 一行挂载整个功能。

启动 Web 界面：

```sh
dsh --profile <profile>
```

打开 设置 → General：Theme 行紧跟在宿主 Appearance 行之后。内置三立方块（Light / Dark / System）与宿主行为完全一致；其余条目切换到已注册主题。第三方选择持久化在 `dsh-themes` 设置命名空间。

## 仅核心包：`@dshthemes/core`

只要主题不要选择器的组合（自制选择界面、斜杠命令、或部署期固定主题），安装 core bundle 后以编程方式选择：

```sh
dsh plugin --profile <profile> add @dshthemes/core
```

```ts
// 在 core 入口之后加载的任意客户端插件中：
ctx.effect(() => {
  ctx.theme.setTheme("catppuccin");
}, "deployment: fixed theme");
```

core 包还导出 `registerThemes(registry)` 与全部主题定义，供完全自定义的组装使用。

## 本地开发

要在 deepseek-harness 的检出上开发主题，按路径把包装进 harness 工作区并添加同样的 patch 行，然后运行 Web 开发组合：

```sh
pnpm dsh web
pnpm run dev:web
```

`dev:web` 监听期间，客户端插件重载由 harness 的 HMR 链处理。
