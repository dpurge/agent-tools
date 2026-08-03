---
name: feature-development
description: End-to-end workflow for planning, designing, implementing, testing, and delivering new software features.
version: 1.0.0
agents:
  - researcher
  - architect
  - engineer
  - reviewer
skills:
  - architecture-review
  - code-review
  - security-review
---

# Feature Development Workflow

This workflow is runnable as the `/feature-development` slash command. The
authoritative, step-by-step instructions live in
[`core/commands/feature-development.md`](../commands/feature-development.md) so
there is a single source of truth.

## When to use

- implementing a new feature or extending existing functionality
- introducing a new service, component, or integration
- modifying significant application behavior

## Phases (summary)

1. **Understand & research** — `researcher` gathers context and affected areas.
2. **Ask questions** — resolve high-impact ambiguities; record assumptions.
3. **Design the architecture** — `architect` produces the design and plan
   (`architecture-review`, `security-review`).
4. **Approval gate — plan** — human reviews and explicitly approves.
5. **Implement** — `engineer` builds the plan; `reviewer` inspects it
   (`code-review`).
6. **Test & validate** — `engineer` adds and runs tests; confirm no regressions.
7. **Approval gate — delivery** — human reviews results and approves.

## Roles

- `researcher` — read-only context gathering.
- `architect` — design and implementation plan (no code changes).
- `engineer` — implementation and tests.
- `reviewer` — read-only review against intent.

## Success criteria

- requirements understood and ambiguities resolved
- design and plan approved by a human
- implementation reviewed, tests pass, no regressions
- delivery approved by a human
