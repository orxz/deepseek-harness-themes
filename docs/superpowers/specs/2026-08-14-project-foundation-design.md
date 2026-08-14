# Project Foundation Design

## Goal

Finish the repository foundation on `feature/project-init` so the project has a stable `main` branch, explicit host dependency boundaries, reproducible package checks, strict continuous integration, and automated Changesets-based npm releases.

## Baseline

The repository already contains the `core` and `ui` workspace packages, ten themes, documentation, 64 passing tests, build configuration, CI, and a tag-triggered npm workflow. The remaining foundation gaps are:

- tsdown reports deprecated `external` and `noExternal` configuration.
- the UI client bundle includes `@deepseek-ai/schemastery` and its transitive `@deepseek-ai/cosmokit` dependency even though `@deepseek-ai/*` modules belong to the runtime host.
- the release workflow treats type-checking as non-blocking and retains a temporary debug workflow.
- releases require hand-authored versions and tags and do not validate installed package tarballs.
- the remote has no `main` branch; `feature/project-init` is the default branch.

## Branch and Repository Model

Create `main` at the current published baseline commit `b7d399d`, push it, and make it the GitHub default branch. Continue all foundation changes on `feature/project-init`, then open a pull request targeting `main`.

Protect correctness in repository configuration rather than relying on contributor memory: pull requests and pushes to `main` run the same complete quality gate. GitHub branch-protection settings are outside the repository changes and are not required for this implementation because enabling or changing them may depend on the repository plan and owner policy.

## Dependency and Bundle Boundary

`@deepseek-ai/*` packages are host-provided runtime modules. Every directly imported host package is declared as a peer dependency and is never bundled into browser artifacts. Development declarations may mirror peer dependencies where local compilation and tests need installed types or implementations. Ordinary implementation dependencies such as `clsx` remain bundled when the host module table does not provide them.

Replace tsdown's deprecated `external` and `noExternal` fields with the supported dependency policy fields. The shared client bundle preset owns the policy so both packages follow one rule:

- host modules and explicitly supplied module-table entries are never bundled;
- remaining browser dependencies are bundled deliberately;
- `@deepseek-harness-themes/core` stays inlined into the full UI plugin so installing the UI package mounts one self-contained product feature;
- standalone Node-facing library builds preserve normal package dependency boundaries.

Tests assert the configuration policy and inspect built artifacts so a future dependency or tsdown upgrade cannot silently reintroduce host code into a plugin bundle.

## Versioning and Release Automation

Use Changesets as the single source for package version intent and changelog entries. Add root commands for creating changesets, applying versions, running the repository quality gate, validating packed artifacts, and publishing.

On every push to `main`, the release workflow uses `changesets/action`:

1. If unreleased changesets exist, create or update a version pull request.
2. When the version pull request is merged and no pending changesets remain, run the complete quality gate and publish changed packages in topological order.
3. Authenticate npm with the existing Classic Automation `NPM_TOKEN`; use the repository-scoped `GITHUB_TOKEN` only for the version pull request and release metadata.

The workflow receives only `contents: write` and `pull-requests: write`; it does not request OIDC permissions. Publishing failures stop the workflow, preserve logs, and never suppress type, test, lint, build, or package-validation failures.

The foundation change includes a patch changeset for both published packages because their distribution build and package metadata contracts change.

## Package Validation and Installation Smoke Test

After a clean build, a repository script packs both workspaces into a temporary directory and validates them as consumers receive them. It must:

- fail when a declared export or required shipped file is absent;
- install the generated tarballs into an isolated temporary consumer without running lifecycle scripts;
- resolve both packages and their public client export paths from that consumer;
- import the core public API and verify its theme catalog is available;
- clean its temporary directory on both success and failure.

Peer host packages are not downloaded during the smoke test. The test validates package installation and export resolution, while unit and bundle-contract tests validate host integration boundaries.

## Continuous Integration

Define one root `gate` command used locally, in pull-request CI, and immediately before publishing. The gate runs, in order:

1. type-checking;
2. production builds;
3. coverage tests;
4. linting;
5. package installation smoke validation.

CI installs with the frozen lockfile and then runs `pnpm gate`. Remove the temporary debug workflow and the release workflow's non-blocking type-check exception. Existing test-first repository policy remains authoritative.

## Documentation

Update contributor documentation with the current branch, changeset, quality-gate, and release workflow. Keep package behavior in package READMEs and workflow behavior in the root contributing guide; do not add release history to current-state prose. `CHANGELOG.md` remains package-release history and Changesets owns subsequent generated entries.

## Testing Strategy

Implementation follows red-green-refactor:

- extend package manifest tests to fail until host runtime dependencies are peers;
- add shared bundle-preset tests that fail on deprecated or unsafe dependency policies;
- extend artifact tests to fail when host modules are embedded rather than required from the host table;
- add smoke-script tests for manifest/export validation and error reporting before adding the script implementation;
- run focused tests after each change, then the complete `pnpm gate` at the end.

Workflow YAML is verified through focused structural assertions and the same commands the workflow invokes. External npm publication is not performed from the feature branch.

## Out of Scope

- adding or changing themes or picker behavior;
- migrating back to npm Trusted Publishing/OIDC;
- changing the deepseek-harness host contracts;
- merging the feature branch without user review;
- requiring paid GitHub repository features.

## Acceptance Criteria

- `main` exists remotely at the published baseline and is the GitHub default branch.
- `feature/project-init` contains the foundation implementation and targets `main` through a pull request.
- builds emit no deprecated dependency-policy warnings and do not bundle `@deepseek-ai/*` runtime code.
- all direct runtime host dependencies are represented in peer dependency metadata.
- Changesets automatically maintains version pull requests and publishes merged versions with `NPM_TOKEN`.
- one strict `pnpm gate` succeeds locally and is used by CI and release automation.
- packed package installation and public export resolution pass in an isolated consumer.
- tests, type-checking, build, coverage, lint, documentation, and lockfile are current.
