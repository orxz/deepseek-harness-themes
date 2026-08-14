# Security Policy

## Scope

These packages ship theme definitions, a token contract, and one settings row.
They add no network calls, no storage beyond the host's own preference layer,
and no agent, prompt, or protocol behavior.

Problems in deepseek-harness itself belong upstream, at
[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness).

## Supported versions

| Package                         | Supported      |
| ------------------------------- | -------------- |
| `@deepseek-harness-themes/core` | latest release |
| `@deepseek-harness-themes/ui`   | latest release |
| anything older                  | not supported  |

Both packages share one version, so a fix ships to both at the same release.

## Reporting a vulnerability

Report privately — never in a public issue or pull request:

**[Open a private security advisory](https://github.com/orxz/deepseek-harness-themes/security/advisories/new)**

Useful reports include the affected package and version, the harness version,
what an attacker gains, and the smallest reproduction you have.

Expect an acknowledgement within seven days. Accepted reports are fixed on a
private branch, published as a patch release to both packages, and disclosed in
an advisory that credits you unless you ask otherwise.
