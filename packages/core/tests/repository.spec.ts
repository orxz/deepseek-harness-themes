import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const repositoryRoot = new URL("../../../", import.meta.url);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(new URL(path, repositoryRoot), "utf8"));
}

function readYaml(path: string): unknown {
  return parse(readFileSync(new URL(path, repositoryRoot), "utf8"));
}

function workflowSteps(workflow: {
  jobs?: Record<string, { steps?: Array<Record<string, unknown>> }>;
}): Array<Record<string, unknown>> {
  return Object.values(workflow.jobs ?? {}).flatMap((job) => job.steps ?? []);
}

describe("repository automation", () => {
  it("keeps the package pair in one public Changesets release group", () => {
    const config = readJson(".changeset/config.json");

    expect(config).toMatchObject({
      access: "public",
      baseBranch: "main",
      fixed: [["@deepseek-harness-themes/core", "@deepseek-harness-themes/ui"]],
      updateInternalDependencies: "patch",
    });
  });

  it("runs the complete quality gate for main and pull requests", () => {
    const workflow = readYaml(".github/workflows/ci.yml") as {
      jobs?: Record<string, { steps?: Array<Record<string, unknown>> }>;
      on?: { pull_request?: unknown; push?: { branches?: string[] } };
    };
    const manifest = readJson("package.json") as {
      scripts?: Record<string, string>;
    };

    expect(workflow.on?.push?.branches).toEqual(["main"]);
    expect(workflow.on).toHaveProperty("pull_request");
    expect(workflowSteps(workflow)).toContainEqual({ run: "pnpm gate" });
    expect(workflowSteps(workflow)).not.toContainEqual(
      expect.objectContaining({ "continue-on-error": true }),
    );
    expect(manifest.scripts?.gate).toBe(
      "pnpm typecheck && pnpm build && pnpm test:coverage && pnpm lint && pnpm fmt:check && pnpm smoke:packages",
    );
    expect(
      existsSync(new URL(".github/workflows/debug.yml", repositoryRoot)),
    ).toBe(false);
  });

  it("uses the official Changesets action with least-privilege release inputs", () => {
    const workflow = readYaml(".github/workflows/release.yml") as {
      jobs?: { release?: { steps?: Array<Record<string, unknown>> } };
      on?: { push?: { branches?: string[] } };
      permissions?: Record<string, string>;
    };
    const releaseStep = workflow.jobs?.release?.steps?.find(
      (step) => step.uses === "changesets/action@v2",
    );
    const manifest = readJson("package.json") as {
      scripts?: Record<string, string>;
    };

    expect(workflow.on?.push?.branches).toEqual(["main"]);
    expect(workflow.permissions).toEqual({
      contents: "write",
      "pull-requests": "write",
    });
    expect(releaseStep).toMatchObject({
      with: {
        "publish-script": "pnpm release",
        "version-script": "pnpm version:packages",
      },
    });
    expect(workflowSteps(workflow)).not.toContainEqual(
      expect.objectContaining({ "continue-on-error": true }),
    );
    expect(manifest.scripts?.["version:packages"]).toBe("changeset version");
    expect(manifest.scripts?.release).toBe("pnpm gate && changeset publish");
  });

  it("disables host peer auto-installation and lints build tooling", () => {
    const workspace = readYaml("pnpm-workspace.yaml");
    const manifest = readJson("package.json") as {
      scripts?: Record<string, string>;
    };

    expect(workspace).toMatchObject({
      autoInstallPeers: false,
      saveExact: true,
      strictPeerDependencies: false,
      verifyDepsBeforeRun: false,
    });
    expect(manifest.scripts?.lint).toBe(
      "oxlint packages build vitest.config.ts",
    );
  });
});

describe("published package metadata", () => {
  const packages = [
    ["core", "@deepseek-harness-themes/core"],
    ["ui", "@deepseek-harness-themes/ui"],
  ] as const;

  it.each(packages)(
    "points %s consumers at the project homepage and issue tracker",
    (directory, name) => {
      const manifest = readJson(`packages/${directory}/package.json`) as {
        bugs?: unknown;
        homepage?: unknown;
        name?: unknown;
      };

      expect(manifest.name).toBe(name);
      expect(manifest.homepage).toBe(
        "https://github.com/orxz/deepseek-harness-themes",
      );
      expect(manifest.bugs).toBe(
        "https://github.com/orxz/deepseek-harness-themes/issues",
      );
    },
  );

  it("routes release history to the generated per-package changelogs", () => {
    const changelog = readFileSync(
      new URL("CHANGELOG.md", repositoryRoot),
      "utf8",
    );

    expect(changelog).toContain("packages/core/CHANGELOG.md");
    expect(changelog).toContain("packages/ui/CHANGELOG.md");
    expect(changelog).toContain("## 0.0.1");
  });

  it.each(packages)(
    "ships the %s license file and the translated readme",
    (directory) => {
      const manifest = readJson(`packages/${directory}/package.json`) as {
        files?: unknown;
      };

      expect(
        existsSync(new URL(`packages/${directory}/LICENSE`, repositoryRoot)),
      ).toBe(true);
      expect(manifest.files).toContain("README.zh.md");
    },
  );
});

describe("local quality hooks", () => {
  it("fixes staged files before formatting them and keeps the result staged", () => {
    const hooks = readYaml("lefthook.yml") as {
      "pre-commit"?: {
        commands?: Record<
          string,
          { priority?: number; run?: string; stage_fixed?: boolean }
        >;
      };
    };
    const commands = hooks["pre-commit"]?.commands ?? {};

    for (const [name, command] of Object.entries(commands)) {
      expect(command.stage_fixed, `${name} must stage what it rewrites`).toBe(
        true,
      );
      expect(command.run, `${name} must act on staged files`).toContain(
        "{staged_files}",
      );
      expect(
        command.run,
        `${name} must not hide flags behind an argument separator`,
      ).not.toContain("-- --fix");
    }
    expect(commands.lint?.priority).toBeLessThan(commands.fmt?.priority ?? 0);
  });

  it("pins one Node version for local shells and continuous integration", () => {
    const nodeVersion = readFileSync(
      new URL(".nvmrc", repositoryRoot),
      "utf8",
    ).trim();
    const manifest = readJson("package.json") as {
      engines?: Record<string, string>;
    };

    expect(nodeVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.engines?.node).toBe(
      `>=${nodeVersion.split(".").slice(0, 2).join(".")}`,
    );
  });
});

describe("continuous integration hardening", () => {
  interface Workflow {
    concurrency?: { group?: string; "cancel-in-progress"?: unknown };
    jobs?: Record<string, { steps?: Array<Record<string, unknown>> }>;
    permissions?: Record<string, string>;
  }

  function setupNodeStep(workflow: Workflow): Record<string, unknown> {
    const step = workflowSteps(workflow).find(
      (candidate) =>
        typeof candidate.uses === "string" &&
        candidate.uses.startsWith("actions/setup-node@"),
    );
    if (step === undefined) throw new Error("workflow never sets up Node");
    return step;
  }

  it("grants the quality gate read-only access and collapses superseded runs", () => {
    const ci = readYaml(".github/workflows/ci.yml") as Workflow;

    expect(ci.permissions).toEqual({ contents: "read" });
    expect(ci.concurrency?.group).toBe(
      "${{ github.workflow }}-${{ github.ref }}",
    );
    expect(ci.concurrency?.["cancel-in-progress"]).toBe(
      "${{ github.event_name == 'pull_request' }}",
    );
  });

  it("resolves the Node version for every workflow from .nvmrc", () => {
    const workflows = [
      readYaml(".github/workflows/ci.yml") as Workflow,
      readYaml(".github/workflows/release.yml") as Workflow,
    ];

    for (const workflow of workflows) {
      const step = setupNodeStep(workflow);

      expect(step.with).toMatchObject({ "node-version-file": ".nvmrc" });
      expect(step.with).not.toHaveProperty("node-version");
    }
  });

  it("leaves the generated lockfile to the package manager", () => {
    const ignore = readFileSync(
      new URL(".prettierignore", repositoryRoot),
      "utf8",
    );

    expect(ignore).toContain("pnpm-lock.yaml");
  });

  it("keeps actions and npm dependencies under weekly review", () => {
    const dependabot = readYaml(".github/dependabot.yml") as {
      updates?: Array<{
        directory?: string;
        "package-ecosystem"?: string;
        schedule?: { interval?: string };
      }>;
      version?: number;
    };
    const updates = dependabot.updates ?? [];

    expect(dependabot.version).toBe(2);
    expect(updates.map((update) => update["package-ecosystem"])).toEqual(
      expect.arrayContaining(["github-actions", "npm"]),
    );
    for (const update of updates) {
      expect(update.schedule?.interval).toBe("weekly");
    }
  });
});

describe("community health files", () => {
  function readText(path: string): string {
    return readFileSync(new URL(path, repositoryRoot), "utf8");
  }

  it("routes vulnerability reports through GitHub without exposing an address", () => {
    const security = readText("SECURITY.md");

    expect(security).toContain("/security/advisories/new");
    expect(security).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
  });

  it("adopts a code of conduct with a real enforcement contact", () => {
    const conduct = readText("CODE_OF_CONDUCT.md");

    expect(conduct).toContain("Contributor Covenant");
    expect(conduct).not.toContain("[INSERT CONTACT METHOD]");
  });

  it("directs new issues into the maintained templates", () => {
    const config = readYaml(".github/ISSUE_TEMPLATE/config.yml") as {
      blank_issues_enabled?: boolean;
      contact_links?: Array<{ about?: string; name?: string; url?: string }>;
    };

    expect(config.blank_issues_enabled).toBe(false);
    expect(config.contact_links?.length ?? 0).toBeGreaterThan(0);
    for (const link of config.contact_links ?? []) {
      expect(link.url).toMatch(/^https:\/\//);
      expect(link.about).toBeTypeOf("string");
    }
  });

  it("shows gate and published versions in both readmes", () => {
    for (const readme of ["README.md", "README.zh.md"]) {
      const content = readText(readme);

      expect(content, readme).toContain("workflows/ci.yml/badge.svg");
      expect(content, readme).toContain(
        "npm/v/%40deepseek-harness-themes%2Fcore",
      );
      expect(content, readme).toContain(
        "npm/v/%40deepseek-harness-themes%2Fui",
      );
    }
  });

  it("documents the pinned toolchain in both contributor guides", () => {
    for (const guide of ["CONTRIBUTING.md", "CONTRIBUTING.zh.md"]) {
      const content = readText(guide);

      expect(content, guide).toContain(".nvmrc");
      expect(content, guide).toContain("pnpm gate");
    }
  });
});

describe("type-checking boundaries", () => {
  it("keeps ambient platform types out of every build", () => {
    const base = readJson("tsconfig.base.json") as {
      compilerOptions?: { types?: string[] };
    };

    expect(base.compilerOptions?.types).toEqual([]);
  });

  it("type-checks the build tooling, not only what tests happen to import", () => {
    const root = readJson("tsconfig.json") as { include?: string[] };

    expect(root.include).toContain("build/**/*");
  });

  it("type-checks against the Node major the toolchain pins", () => {
    const nodeMajor = readFileSync(new URL(".nvmrc", repositoryRoot), "utf8")
      .trim()
      .split(".")[0];
    const manifest = readJson("package.json") as {
      devDependencies?: Record<string, string>;
    };

    expect(manifest.devDependencies?.["@types/node"]).toMatch(
      new RegExp(`^\\D*${nodeMajor}\\.`),
    );
  });
});
