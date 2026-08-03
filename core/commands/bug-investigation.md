---
description: Investigate a defect systematically — reproduce, find the root cause, fix it with a regression test, and validate.
argument-hint: <describe the bug / paste the error>
---

# Bug Investigation

Diagnose and fix the defect described below. Understand the failure before
changing any code. **Do not edit code until the approval gate in phase 5.**

**Bug report:** $ARGUMENTS

If the report is empty, ask for the symptom, expected vs actual behavior, and
reproduction steps before continuing.

---

## 1. Gather context

Collect the symptom, expected vs actual behavior, affected users/systems,
reproduction steps, and recent changes. Note when it started and whether it is
consistent across environments.

## 2. Reproduce

Use the `researcher` agent to reproduce locally and isolate the minimal case.
Record the environment, commands run, and exact output. If it cannot be
reproduced, say so and gather more evidence before guessing.

## 3. Analyze & form hypotheses

Inspect the relevant code paths, dependencies, configuration, and recent commits
(`repo-analyzer` when available; `code-review` and `architecture-review` skills).
List candidate causes; for each, note supporting evidence and how to confirm it.

## 4. Verify the root cause

Confirm the cause with diagnostics or a controlled change. The root cause must
explain why the issue occurs, why here, and why existing safeguards missed it.

## 5. 🚦 Approval gate — fix plan

Present the root cause and the smallest safe fix (with regression risk and
security implications) to the user. **Stop and wait** for explicit approval
before editing code.

## 6. Implement the fix

Use the `engineer` agent: make the smallest change that fixes the root cause,
follow repository conventions, and add a regression test that fails without the
fix. For security-related bugs, apply the `security-review` skill.

## 7. Validate

Confirm the original reproduction is fixed, the new test passes, and no
regressions were introduced. Check edge cases and error handling.

## 8. Document

Summarize: Problem, Impact, Root Cause, Fix, Tests Added, Follow-up Actions.
