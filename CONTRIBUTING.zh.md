# 贡献指南

欢迎社区主题与修复。本仓库遵循 deepseek-harness 插件约定——请先阅读 [AGENTS.md](AGENTS.md)。

## 环境准备

```sh
nvm use          # .nvmrc 固定了 CI 与发布所用的 Node 版本
pnpm install     # pnpm 11.7.0 由 packageManager 经 Corepack 提供
pnpm typecheck   # 首次类型检查通过即搭建完成
```

`pnpm install` 同时会同步 Git 钩子：提交时自动修复并格式化暂存文件，推送前运行 `pnpm typecheck`。

## 工作流

1. 从 `main` 建分支（`feature/<name>`）。
2. 测试先行：新增或更新 `packages/*/tests/**/*.spec.ts`，运行 `pnpm test`（红），实现，再运行（绿）。
3. 修改任一发布包时运行 `pnpm changeset`，选择受影响的包与 SemVer 级别，并填写面向使用者的摘要。仅文档或仅测试变更无需 changeset。
4. 推送前运行完整本地门禁：`pnpm gate`。
5. 每个主题必须覆盖完整 `REQUIRED_TOKENS` 与 `RECOMMENDED_TOKENS`（`pnpm test` 强制）。见 [docs/creating-a-theme.md](docs/creating-a-theme.md)。
6. 同一变更内同步文档：[docs/theme-spec.md](docs/theme-spec.md) 是 `packages/core/src/tokens.ts` 的双胞胎；包 README 是逐包契约。
7. 提交 PR，附变更摘要与 `pnpm gate` 结果。

## 新增主题

按 [docs/creating-a-theme.md](docs/creating-a-theme.md)：一个冻结的 `ThemeDefinition` 文件、目录登记、双语词典文案、`pnpm test` 全绿。

## 发布

发布的前提是 npm 组织 `deepseek-harness-themes` 已存在，且 `NPM_TOKEN` 属于其中有发布权限的成员：该 scope 不是用户名，两个条件不同时满足时 npm 会对每一次发布 `PUT` 返回 `404 Not Found`。release workflow 在发布前会输出 npm 身份与 scope 权限，因此失败时日志会指明缺的是哪一半。

UI 发布物会内联 core，因此 Changesets 保持 `core` 与 `ui` 版本一致。发布包改动合入 `main` 后，自动创建或更新版本 PR；版本 PR 合并后运行 `pnpm gate`、发布两个 npm 包，并创建对应的 GitHub Release 与标签。

## 提交风格

每次提交一个逻辑变更，说明改了什么与为什么。文档遵循 [docs/AGENTS.md](docs/AGENTS.md) 的 tier 纪律——每个事实一个家，只写当前状态。
