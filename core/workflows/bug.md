---
name: bug
description: Systematic workflow for investigating, diagnosing, and resolving software defects.
version: 1.0.0
agents:
  - researcher
  - engineer
  - reviewer
skills:
  - code-review
  - architecture-review
  - security-review
---

# Bug Investigation Workflow

This workflow is runnable as the `/bug` slash command. The
authoritative, step-by-step instructions live in
[`core/commands/bug.md`](../commands/bug.md) so there
is a single source of truth.

## When to use

- a bug has been reported or behavior differs from expectations
- a regression or production issue needs diagnosis
- a failure is hard to reproduce

## Phases (summary)

1. **Gather context** — symptom, expected vs actual, repro steps, recent changes.
2. **Reproduce** — `researcher` isolates a minimal, reliable reproduction.
3. **Analyze & hypothesize** — inspect code paths and recent commits
   (`code-review`, `architecture-review` skills).
4. **Verify the root cause** — confirm why it happens, why here, and why existing
   safeguards missed it.
5. **Approval gate — fix plan** — the human reviews the root cause and fix and
   explicitly approves before any code changes.
6. **Implement** — `engineer` makes the smallest fix plus a regression test
   (`security-review` skill for security bugs).
7. **Validate** — original reproduction fixed, new test passes, no regressions.
8. **Document** — Problem, Impact, Root Cause, Fix, Tests Added, Follow-up.

## Roles

- `researcher` — read-only reproduction and code investigation.
- `engineer` — the fix and its regression test.
- `reviewer` — review of the fix (with the `security-review` skill for security
  bugs).

## Success criteria

- root cause identified with evidence
- fix approved by a human before implementation
- regression test added; no regressions introduced
- findings documented
