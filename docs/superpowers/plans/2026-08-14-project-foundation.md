# Project Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the repository foundation with a real `main` branch, safe host dependency boundaries, reproducible package smoke tests, strict CI, and fully automated Changesets releases.

**Architecture:** Keep the existing two-package pnpm workspace and centralize browser dependency policy in `build/client-bundle.ts`. Treat `core` and `ui` as one Changesets fixed release group because UI inlines core, validate packed packages from an isolated consumer, and reuse one root `gate` script in CI and publishing.

**Tech Stack:** Node.js 22.19+, pnpm 11.7.0, TypeScript 5.9, Vitest 3, tsdown 0.22, Changesets 3 / Changesets Action 2, GitHub Actions, npm.

## Global Constraints

- Every theme covers the complete `REQUIRED_TOKENS` set in `packages/core/src/tokens.ts`.
- Tests are added or updated before production implementation.
- Registration functions return disposers and JSDoc documents contracts, not reasoning.
- Documentation keeps one current-state home per fact and no prose change history.
- Runtime dependency declarations live in `peerDependencies`; every `@deepseek-ai/*` runtime module is host-provided and never bundled.
- Classic Automation `NPM_TOKEN` remains the npm authentication mechanism; OIDC is out of scope.
- `main` starts at published baseline commit `b7d399d`; implementation remains on `feature/project-init` until pull-request review.

---

## File Structure

- `build/client-bundle.ts`: the single tsdown policy for Node libraries, browser plugin factories, CSS modules, host externals, and per-package deliberate bundled dependencies.
- `build/package-smoke.ts`: pack, install, validate exports, import core, and clean a temporary consumer.
- `packages/core/tests/build-config.spec.ts`: black-box tests for the shared client-bundle dependency policy.
- `packages/core/tests/package-smoke.spec.ts`: focused tests for package manifest/export validation and failure messages.
- `packages/core/tests/repository.spec.ts`: repository-level contract tests for Changesets and workflow gate wiring.
- `packages/ui/tests/bundle.spec.ts`: UI package metadata and host peer-dependency contract.
- `.changeset/config.json`: public fixed-group monorepo release policy based on `main`.
- `.changeset/project-foundation.md`: the patch release intent for the foundation change.
- `.github/workflows/ci.yml`: strict pull-request and `main` quality gate.
- `.github/workflows/release.yml`: Changesets version PR and automated npm publication.
- `package.json` / `pnpm-lock.yaml`: root commands and Changesets CLI dependency.
- `packages/ui/package.json`: move Schemastery to the host peer boundary.
- `CONTRIBUTING.md` / `CONTRIBUTING.zh.md`: contributor workflow and release contract.
- `.github/PULL_REQUEST_TEMPLATE.md`: changeset and complete-gate checklist.

---

### Task 1: Establish the Main-Branch Baseline

**Files:** None.

**Interfaces:**

- Consumes: published baseline commit `b7d399d` and GitHub repository `orxz/deepseek-harness-themes`.
- Produces: local and remote `main` pointing to `b7d399d`, GitHub default branch `main`, active development branch `feature/project-init`.

- [ ] **Step 1: Verify the immutable inputs**

Run:

```bash
git status --short --branch
git rev-parse b7d399d
git branch --show-current
gh auth status
```

Expected: clean `feature/project-init`, full SHA for `b7d399d`, and authenticated GitHub CLI access.

- [ ] **Step 2: Create and push `main` without moving the feature branch**

Run:

```bash
git branch main b7d399d
git push -u origin main
```

Expected: local `main` and `origin/main` point to `b7d399d`; current branch remains `feature/project-init`.

- [ ] **Step 3: Set and verify the GitHub default branch**

Run:

```bash
gh repo edit orxz/deepseek-harness-themes --default-branch main
gh repo view orxz/deepseek-harness-themes --json defaultBranchRef
```

Expected JSON: `{"defaultBranchRef":{"name":"main"}}`.

---

### Task 2: Enforce Host Dependency and Bundle Contracts

**Files:**

- Create: `packages/core/tests/build-config.spec.ts`
- Modify: `packages/ui/tests/bundle.spec.ts`
- Modify: `build/client-bundle.ts`
- Modify: `packages/ui/tsdown.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: `clientBundle(id, libEntry, clientEntry, externals?)` and package runtime imports.
- Produces: `clientBundle(id, libEntry, clientEntry, options?)` using `deps.neverBundle`, `deps.alwaysBundle`, and `deps.onlyBundle`; Schemastery peer metadata.

- [ ] **Step 1: Write failing build-policy tests**

Add `packages/core/tests/build-config.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { UserConfig } from "tsdown";
import { clientBundle } from "../../../build/client-bundle.ts";

describe("client bundle dependency policy", () => {
  const client = clientBundle("example", "src/index.ts", "src/client.ts", {
    bundledDependencies: ["@deepseek-harness-themes/core", "clsx"],
  })[1] as UserConfig;

  it("uses current tsdown dependency options", () => {
    expect(client.external).toBeUndefined();
    expect(client.noExternal).toBeUndefined();
    expect(client.deps?.neverBundle).toBeDefined();
    expect(client.deps?.alwaysBundle).toBeTypeOf("function");
    expect(client.deps?.onlyBundle).toEqual([
      "@deepseek-harness-themes/core",
      "clsx",
    ]);
  });

  it("externalizes host modules and bundles product dependencies", () => {
    const alwaysBundle = client.deps?.alwaysBundle as (
      id: string,
      importer?: string,
    ) => boolean;
    expect(alwaysBundle("@deepseek-ai/schemastery")).toBe(false);
    expect(alwaysBundle("@deepseek-ai/dsh-client-runtime/client")).toBe(false);
    expect(alwaysBundle("react/jsx-runtime")).toBe(false);
    expect(alwaysBundle("clsx")).toBe(true);
    expect(alwaysBundle("@deepseek-harness-themes/core")).toBe(true);
  });
});
```

Extend the UI manifest test to assert:

```ts
expect(manifest.peerDependencies?.["@deepseek-ai/schemastery"]).toBe("^3.18.1");
expect(manifest.dependencies).not.toHaveProperty("@deepseek-ai/schemastery");
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
pnpm test packages/core/tests/build-config.spec.ts packages/ui/tests/bundle.spec.ts
```

Expected: failures for deprecated config fields, missing `deps` policy, and Schemastery under `dependencies`.

- [ ] **Step 3: Implement the minimal dependency policy**

In `build/client-bundle.ts`, replace `external` / `noExternal` with a shared matcher and:

```ts
const HOST_MODULE = /^@deepseek-ai(?:\/|$)/;
function matchesModule(id: string, moduleId: string): boolean {
  return id === moduleId || id.startsWith(`${moduleId}/`);
}

function isClientExternal(id: string, externals: readonly string[]): boolean {
  return (
    HOST_MODULE.test(id) || externals.some((item) => matchesModule(id, item))
  );
}
```

Add `ClientBundleOptions` with `externals?: readonly string[]` and `bundledDependencies?: readonly string[]`. Use the following client configuration:

```ts
deps: {
  neverBundle: [HOST_MODULE, ...clientExternals],
  alwaysBundle: (specifier: string) =>
    bundledDependencies.some((item) => matchesModule(specifier, item)) &&
    !isClientExternal(specifier, clientExternals),
  onlyBundle: [...bundledDependencies],
},
```

Pass `{ bundledDependencies: ["@deepseek-harness-themes/core", "clsx"] }` from `packages/ui/tsdown.config.ts`; core passes no options. This avoids unused allow-list entries in the core build while keeping UI's inlined dependency set explicit.

Move `@deepseek-ai/schemastery` from UI `dependencies` to `peerDependencies` as `^3.18.1`, mirror exact `3.18.1` under `devDependencies`, and refresh the lockfile with `pnpm install --lockfile-only`.

- [ ] **Step 4: Verify GREEN and inspect a fresh bundle**

Run:

```bash
pnpm test packages/core/tests/build-config.spec.ts packages/ui/tests/bundle.spec.ts
pnpm build
```

Expected: focused tests pass; build emits no `external`, `noExternal`, or unintended-bundling warnings; `packages/ui/lib/client.js` contains a host `require("@deepseek-ai/schemastery")` and does not contain Schemastery's implementation.

- [ ] **Step 5: Commit**

```bash
git add build/client-bundle.ts packages/core/tests/build-config.spec.ts packages/ui/tests/bundle.spec.ts packages/ui/package.json packages/ui/tsdown.config.ts pnpm-lock.yaml
git commit -m "build: enforce host dependency boundaries"
```

---

### Task 3: Add Reproducible Packed-Package Validation

**Files:**

- Create: `build/package-smoke.ts`
- Create: `packages/core/tests/package-smoke.spec.ts`
- Modify: `package.json`

**Interfaces:**

- Produces: `validatePackageDirectory(packageRoot: string): Promise<void>` and `runPackageSmoke(workspaceRoot?: string): Promise<void>`.
- Consumes: built `lib` files, package export maps, `pnpm pack`, and the local pnpm store.

- [ ] **Step 1: Write failing validator tests**

Create temporary package directories in `packages/core/tests/package-smoke.spec.ts`. Cover a valid package with `./lib/index.js`, `./lib/index.d.ts`, `./lib/client.js`, `./lib/client.d.ts`, and `./cordis.patch.yml`, plus a package whose `./client` default target is missing:

```ts
await expect(validatePackageDirectory(validRoot)).resolves.toBeUndefined();
await expect(validatePackageDirectory(brokenRoot)).rejects.toThrow(
  "missing export target ./lib/client.js",
);
```

Clean test directories with `afterEach` and `rm(path, { recursive: true, force: true })`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm test packages/core/tests/package-smoke.spec.ts
```

Expected: module-not-found failure for `build/package-smoke.ts`.

- [ ] **Step 3: Implement manifest and export validation**

Implement `validatePackageDirectory` to parse installed `package.json`, require `name`, `files`, and `exports`, recursively collect each string target under the export map, normalize leading `./`, and throw package-qualified messages for absent targets. Also require `cordis.patch.yml` and the four public `lib` entry files.

- [ ] **Step 4: Verify validator GREEN**

Run:

```bash
pnpm test packages/core/tests/package-smoke.spec.ts
```

Expected: valid fixture passes and missing export fixture fails with the asserted message.

- [ ] **Step 5: Implement the isolated consumer smoke flow**

Implement `runPackageSmoke` with `mkdtemp` and `try/finally`:

1. run `pnpm --filter @deepseek-harness-themes/core pack --pack-destination` with the generated `packsDirectory`;
2. run the equivalent UI pack;
3. create `consumer/package.json` under the generated temporary root with `{ "private": true, "type": "module" }`;
4. install both tarballs with `pnpm add --offline --ignore-scripts --config.auto-install-peers=false --config.strict-peer-dependencies=false`;
5. validate both installed package directories;
6. dynamically import the installed core `lib/index.js` and require ten themes;
7. always remove the unique temporary root.

Expose the script through:

```json
"smoke:packages": "node build/package-smoke.ts"
```

- [ ] **Step 6: Build and run the real smoke test**

Run:

```bash
pnpm build
pnpm smoke:packages
```

Expected: both tarballs install offline, all export targets exist, core imports with ten themes, and no smoke directory remains.

- [ ] **Step 7: Commit**

```bash
git add build/package-smoke.ts packages/core/tests/package-smoke.spec.ts package.json
git commit -m "test: validate packed package installation"
```

---

### Task 4: Install Changesets and Make CI/Publishing Strict

**Files:**

- Create: `.changeset/config.json`
- Create: `.changeset/project-foundation.md`
- Create: `packages/core/tests/repository.spec.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/release.yml`
- Delete: `.github/workflows/debug.yml`

**Interfaces:**

- Consumes: `pnpm gate`, `pnpm version`, `pnpm release`, `NPM_TOKEN`, and GitHub's repository token.
- Produces: fixed-group version pull requests and automatic topological publication from `main`.

- [ ] **Step 1: Write failing repository contract tests**

Add `packages/core/tests/repository.spec.ts` to read root files and assert:

```ts
expect(rootPackage.scripts?.gate).toBe(
  "pnpm typecheck && pnpm build && pnpm test:coverage && pnpm lint && pnpm smoke:packages",
);
expect(changesets.baseBranch).toBe("main");
expect(changesets.access).toBe("public");
expect(changesets.fixed).toContainEqual([
  "@deepseek-harness-themes/core",
  "@deepseek-harness-themes/ui",
]);
expect(ci).toContain("run: pnpm gate");
expect(release).toContain("uses: changesets/action@v2");
expect(release).toContain("publish-script: pnpm release");
expect(release).not.toContain("continue-on-error");
expect(existsSync(debugWorkflow)).toBe(false);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm test packages/core/tests/repository.spec.ts
```

Expected: missing Changesets configuration and root scripts, old workflow structure, and existing debug workflow.

- [ ] **Step 3: Install and configure Changesets 3**

Run:

```bash
pnpm add -Dw @changesets/cli@^3
```

Create `.changeset/config.json` with public access, `baseBranch: "main"`, `updateInternalDependencies: "patch"`, `bumpVersionsWithWorkspaceProtocolOnly: true`, and a fixed group containing both packages. Add a patch changeset describing host dependency externalization, package validation, and release automation for both packages.

Add root scripts:

```json
"changeset": "changeset",
"version:packages": "changeset version",
"gate": "pnpm typecheck && pnpm build && pnpm test:coverage && pnpm lint && pnpm smoke:packages",
"release": "pnpm gate && changeset publish"
```

- [ ] **Step 4: Replace CI and release workflows**

Update both workflows to `actions/checkout@v6`, `pnpm/action-setup@v6`, and `actions/setup-node@v6` with Node `22.19.0` and pnpm caching. CI runs only frozen install plus `pnpm gate`.

Release triggers on pushes to `main`, sets concurrency to `${{ github.workflow }}-${{ github.ref }}`, grants `contents: write` and `pull-requests: write`, and runs:

```yaml
- name: Create release pull request or publish
  uses: changesets/action@v2
  with:
    publish-script: pnpm release
    version-script: pnpm version:packages
    commit-message: "chore: version packages"
    pr-title: "chore: version packages"
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Remove `.github/workflows/debug.yml`.

- [ ] **Step 5: Verify GREEN and Changesets status**

Run:

```bash
pnpm test packages/core/tests/repository.spec.ts
pnpm changeset status
```

Expected: repository contract passes and Changesets reports patch releases for the fixed `core`/`ui` group.

- [ ] **Step 6: Commit**

```bash
git add .changeset .github/workflows package.json pnpm-lock.yaml packages/core/tests/repository.spec.ts
git commit -m "ci: automate fixed-group releases"
```

---

### Task 5: Document the Open-Source Contribution and Release Contract

**Files:**

- Modify: `CONTRIBUTING.md`
- Modify: `CONTRIBUTING.zh.md`
- Modify: `.github/PULL_REQUEST_TEMPLATE.md`

**Interfaces:**

- Consumes: root scripts and Changesets workflow from Tasks 3–4.
- Produces: one current contributor path from branch creation through changeset and local gate.

- [ ] **Step 1: Add a failing documentation assertion**

Extend `packages/core/tests/repository.spec.ts` to require both contributor guides to contain `pnpm changeset` and `pnpm gate`, and the PR template to contain unchecked Changesets and full-gate checklist entries.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm test packages/core/tests/repository.spec.ts
```

Expected: documentation contract assertions fail.

- [ ] **Step 3: Update current-state documentation**

Document branching from `main`, adding a changeset for published-package changes, running `pnpm gate`, and automatic version-PR/publication behavior in both languages. Replace the PR template's separate local checks with `pnpm gate`, add a changeset checkbox with a documentation-only exemption, and keep release credentials out of contributor instructions.

- [ ] **Step 4: Verify GREEN and formatting**

Run:

```bash
pnpm test packages/core/tests/repository.spec.ts
pnpm exec prettier --check CONTRIBUTING.md CONTRIBUTING.zh.md .github/PULL_REQUEST_TEMPLATE.md
```

Expected: assertions and formatting pass.

- [ ] **Step 5: Commit**

```bash
git add CONTRIBUTING.md CONTRIBUTING.zh.md .github/PULL_REQUEST_TEMPLATE.md packages/core/tests/repository.spec.ts
git commit -m "docs: define changeset contribution workflow"
```

---

### Task 6: Full Verification and Pull-Request Handoff

**Files:**

- Modify if formatting requires: files already listed above.

**Interfaces:**

- Consumes: all tasks and the acceptance criteria in the design.
- Produces: verified feature branch pushed to origin and a pull request targeting `main`.

- [ ] **Step 1: Run the complete gate from a clean build state**

Run:

```bash
pnpm gate
```

Expected: typecheck, build, 100% coverage thresholds, lint, offline pack/install smoke test all exit 0 with no dependency-policy warnings.

- [ ] **Step 2: Inspect distribution boundaries and repository state**

Run:

```bash
rg -n "schemastery|cosmokit" packages/ui/lib/client.js
git diff --check main...HEAD
git status --short --branch
pnpm changeset status
```

Expected: Schemastery appears only as a host `require`, Cosmokit implementation is absent, diff check is clean, only intended commits differ from `main`, and both packages have patch release intent.

- [ ] **Step 3: Push the feature branch and create a pull request**

Run:

```bash
git push origin feature/project-init
gh pr create --base main --head feature/project-init \
  --title "build: complete project foundation" \
  --body $'## Summary\n- externalize deepseek-harness host dependencies\n- add packed-package installation validation\n- add strict CI and Changesets v2 release automation\n\n## Verification\n- pnpm gate'
```

PR body summarizes host boundary, package smoke test, strict gate, Changesets automation, documentation, and the exact `pnpm gate` result.

- [ ] **Step 4: Verify remote handoff**

Run:

```bash
gh pr view --json url,baseRefName,headRefName,state,statusCheckRollup
git status --short --branch
```

Expected: open PR from `feature/project-init` to `main`, remote branch synchronized, clean worktree.
