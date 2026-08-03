---
name: doc-review
description: Audit all project documentation against the current code, report discrepancies with evidence, and fix them after human approval.
version: 1.0.0
agents:
  - technical-writer
skills:
  - doc-review
  - code-review
---

# Documentation Review Workflow

This workflow is runnable as the `/doc-review` slash command. The authoritative,
step-by-step instructions live in
[`core/commands/doc-review.md`](../commands/doc-review.md).

## When to use

- after code changes that may have outdated the docs
- before a release, to confirm the documentation is accurate
- periodically, to catch drift between docs and code

## Phases (summary)

1. **Collect** — enumerate the documentation in scope (README, `docs/`, `doc/`,
   and other markdown), excluding `node_modules/`, git-ignored build output, and
   generated content inside `packages/*`.
2. **Audit** — verify each claim against the current code with evidence
   (`doc-review`, `code-review` skills).
3. **Report** — present findings grouped by severity, each with `path:line`
   evidence, why it's a problem, and a suggested fix.
4. **Approval gate** — propose the fixes; the human decides which to apply.
5. **Fix** — the `technical-writer` applies the approved fixes and summarizes.

## Roles

- `technical-writer` — the audit, the findings report, and the approved
  documentation fixes.

## Success criteria

- documentation in scope is checked against the current code
- every finding has evidence, a reason, and a suggested fix
- fixes are applied only after explicit human approval
