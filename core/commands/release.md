---
description: Prepare and cut a release safely — review scope, validate quality, run a security check, then publish after approval.
argument-hint: <version or release scope, optional>
---

# Release

Prepare a release for the scope below. Publishing is an outward, hard-to-reverse
action — **do not tag, push, or publish until the approval gate in phase 5.**

**Release scope:** $ARGUMENTS

If the scope is empty, determine it from the changes since the last release
(tags, changelog, merged work) and confirm it with the user.

---

## 1. Review scope

Collect included changes, fixes, and known limitations. Identify affected systems
and users, breaking changes, and migration requirements. Confirm the release
goals.

## 2. Analyze changes

Review changed files, dependency and configuration changes, and architecture
impact (`repo-analyzer` when available; `code-review`, `architecture-review`
skills). Assess maintainability, reliability, and compatibility.

## 3. Security review

Use the `reviewer` agent with the `security-review` skill: check auth changes,
sensitive-data handling, dependency vulnerabilities, and that no secrets or unsafe
configuration are being shipped.

## 4. Validate quality

Use the `engineer` agent to run the build, tests, and any static analysis.
Confirm expected behavior, no regressions, and acceptable performance. Prepare
version bump, changelog, and release notes.

## 5. 🚦 Approval gate — publish

Present the release scope, validation results, security findings, and the exact
publish plan (version, tag, artifacts). **Stop and wait** for explicit approval
before executing.

## 6. Execute & verify

After approval, follow the publish plan (bump version, tag, publish artifacts).
Monitor for failures. Verify the release is available and integrations still work.

## 7. Document

Summarize: Version, Date, Summary, Changes, Breaking Changes, Migration Notes,
Known Issues, Rollback Plan.
