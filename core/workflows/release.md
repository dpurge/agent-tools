---
name: release
description: Workflow for preparing, validating, documenting, and delivering software releases safely.
version: 1.0.0
agents:
  - engineer
  - reviewer
skills:
  - code-review
  - architecture-review
  - security-review
---

# Release Workflow

This workflow is runnable as the `/release` slash command. The authoritative,
step-by-step instructions live in
[`core/commands/release.md`](../commands/release.md) so there is a single source
of truth.

## When to use

- preparing a production or versioned release
- publishing packages or completing a milestone
- deploying significant changes

## Phases (summary)

1. **Review scope** — included changes, breaking changes, migration needs.
2. **Analyze changes** — changed files, dependencies, config, and architecture
   impact (`code-review`, `architecture-review` skills).
3. **Security review** — `reviewer` with the `security-review` skill checks auth,
   secrets, and dependency risk.
4. **Validate quality** — `engineer` runs build, tests, and static analysis, and
   prepares the version bump and release notes.
5. **Approval gate — publish** — the human reviews results and the exact publish
   plan (version, tag, artifacts) and explicitly approves before any tag, push, or
   publish.
6. **Execute & verify** — follow the publish plan; confirm the release is
   available and integrations work.
7. **Document** — Version, Date, Changes, Breaking Changes, Migration, Rollback.

## Roles

- `engineer` — build, tests, and release artifacts.
- `reviewer` — security and change review (with the `security-review` skill).

## Success criteria

- release scope confirmed and changes reviewed
- security risks assessed
- validation passes before publishing
- publish approved by a human; release documented
