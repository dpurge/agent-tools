---
description: Prepare and cut a release safely — review scope, validate quality, run a security check, then publish after approval.
argument-hint: <version or release scope, optional>
---

# Release

Prepare a release for the scope below. Publishing is an outward, hard-to-reverse
action — **do not tag, push, or publish until the approval gate in phase 6.**

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

## 5. Release automation check

A release is only as good as the automation that cuts it. Take the artifact
list from the constitution's `specs/tech-stack.md` `### Artifacts` table (its
`Changelog` and `Versioning` columns and the `Built from:` note); if there is
none, derive the artifacts from the repo (manifests, workflows, task runners).
For **each artifact**, read the release automation (CI workflows, release
scripts) and verify, with file and line as evidence:

- **a. Triggers.** It runs on every path the artifact is built from,
  including the shared modules it consumes — a change to a shared module must
  trigger every consumer's release.
- **b. Same commands.** It runs the same build and test commands the project
  documents, ideally one script shared by CI and local runs, and it builds
  from a clean checkout (no gitignored output it silently relies on).
- **c. Stamping.** It turns `## [Unreleased]` into `## [version] - date` and
  updates every other version field, in the **same** release commit.
- **d. Tag.** The tag points at that commit.
- **e. No retrigger.** The bot's own push cannot start the release again:
  pushes made with `GITHUB_TOKEN` do not trigger workflow runs, and
  `[skip ci]` in the message skips push-triggered runs.
- **f. History gap.** A changelog that has versions with tags but no
  `## [version]` sections is reported — the history is missing, and someone
  decides whether to backfill it.

Report one line per artifact and item: ok, missing, or unverifiable. If any
item is missing, fixing the automation is part of the release work, not a
follow-up: draft the change, then prove it with a local simulation against a
throwaway bare repository (clone it, run the release steps, check the commit,
the stamped changelog, and the tag) — never try it for the first time on
`main`. Pushing the fix is outward and waits for the approval gate below.
agent-tools' own `.github/workflows/release.yml`, with
`scripts/set-version.js` and `scripts/release-changelog.js`, is a working
reference for stamping versions and changelogs and tagging in one release
commit (items c and d); it is started by hand, so it does not show the push
trigger or retrigger items (a and e).

## 6. 🚦 Approval gate — publish

Present the release scope, validation results, security findings, and the exact
publish plan (version, tag, artifacts). **Stop and wait** for explicit approval
before executing.

## 7. Execute & verify

After approval, follow the publish plan (bump version, tag, publish artifacts).
Monitor for failures. Verify the release is available and integrations still work.

## 8. Document

Summarize: Version, Date, Summary, Changes, Breaking Changes, Migration Notes,
Known Issues, Rollback Plan.
