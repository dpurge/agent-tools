---
name: constitution-format
description: Canonical file format for a project's constitution — specs/mission.md, specs/tech-stack.md, specs/roadmap.md — used by /code to create or update them consistently.
version: 1.0.0
---

# Constitution File Format

## Purpose

Define the exact, repeatable shape of a project's constitution files so any
agent creating or updating them produces the same structure every time,
instead of freeform prose. Used by the `/code` command's constitution phase
(see `core/commands/code.md`) and available to any later phase (`specify`,
`plan`, ...) that needs to read or extend these files.

## Shared frontmatter

All three files share the same frontmatter block:

```yaml
---
version: 1           # int, starts at 1, incremented on each approved update
status: draft         # "draft" until approved, then "approved"
updated: YYYY-MM-DD    # ISO date of the last approved write
---
```

## File: specs/mission.md

Fixed `##` sections, in order:

- **Problem** — what problem does this project solve today? Ground this in
  what the code actually does, not aspiration.
- **Users** — who or what consumes this: end users, other services, CLI
  operators, other developers?
- **Value proposition** — what does success look like? Why does this exist
  instead of an alternative? One or two tight paragraphs, not marketing copy.
- **Non-goals** — what is explicitly out of scope, to keep the mission from
  drifting?

Almost entirely evidence-grounded: cite `path:line` or file evidence for
every claim.

## File: specs/tech-stack.md

Fixed `##` sections, in order:

- **Languages & runtimes** — versions matter (e.g. "Node.js >= 20"); cite the
  source (`engines` field, CI matrix, etc.).
- **Frameworks & libraries** — only the ones that materially shape how code
  is written here, not every dependency in the lockfile.
- **Infrastructure & tooling** — build, test, CI/CD, packaging, release
  process, deployment targets.
- **Key conventions** — repo-specific constraints a contributor or agent must
  follow.

Entirely evidence-grounded: read manifests, lockfiles, and CI config; never
infer from vibes.

## File: specs/roadmap.md

Fixed `##` sections, in order:

- **Now** — what is actively being worked on, right now.
- **Next** — what is planned to start once "Now" items land.
- **Later** — directional, lower-confidence future work; fine to be sparse.
- **Out of scope** — ideas explicitly considered and deferred or rejected,
  and why.

The exception to evidence-grounding: roadmap is inherently forward-looking,
so most of it comes from the user, not the repo. Never invent roadmap items;
include only what the user has actually said, or what is unambiguously
already in motion (e.g. an open PR).

## Drafting rules

- No sections beyond the fixed list above — do not add extras.
- Remove every `<!-- guidance -->` comment before writing; templates carry
  them only to prompt what belongs in each section.
- Only write a file once its content has explicit human approval, with
  `status: approved` and `updated` set to the approval date.

## Updating an existing (approved) file

Never silently rewrite an approved file. Re-gather evidence for that file's
scope only, then apply the `doc-review` skill's method to produce an
evidence-linked account of what changed and why (drift found vs. code, or new
direction from the user) before presenting it for approval. On approval,
increment `version`, set `updated`, and keep `status: approved`.
