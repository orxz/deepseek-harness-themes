# 贡献指南

欢迎社区主题与修复。本仓库遵循 deepseek-harness 插件约定——请先阅读 [AGENTS.md](AGENTS.md)。

## 环境准备

```sh
# Node >= 22.19，pnpm 11.7.0（Corepack）
pnpm install
pnpm typecheck   # 首次类型检查通过即搭建完成
```

## 工作流

1. 从 `main` 建分支（`feature/<name>`）。
2. 测试先行：新增或更新 `packages/*/tests/**/*.spec.ts`，运行 `pnpm test`（红），实现，再运行（绿）。
3. 推送前跑本地门禁：`pnpm typecheck && pnpm test:coverage && pnpm lint`。
4. 每个主题必须覆盖完整 `REQUIRED_TOKENS` 与 `RECOMMENDED_TOKENS`（`pnpm test` 强制）。见 [docs/creating-a-theme.md](docs/creating-a-theme.md)。
5. 同一变更内同步文档：[docs/theme-spec.md](docs/theme-spec.md) 是 `packages/core/src/tokens.ts` 的双胞胎；包 README 是逐包契约。
6. 提交 PR，附变更摘要与验证过程。

## 新增主题

按 [docs/creating-a-theme.md](docs/creating-a-theme.md)：一个冻结的 `ThemeDefinition` 文件、目录登记、双语词典文案、`pnpm test` 全绿。

## 提交风格

每次提交一个逻辑变更，说明改了什么与为什么。文档遵循 [docs/AGENTS.md](docs/AGENTS.md) 的 tier 纪律——每个事实一个家，只写当前状态。
