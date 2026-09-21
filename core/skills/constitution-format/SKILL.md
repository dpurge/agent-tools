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

Almost entirely evidence-grounded: every claim must trace to something the
researcher actually read in the codebase — but don't write `path:line`
citations or quoted snippets into this file. A citation baked into the
mission statement goes stale the moment the referenced line moves or the
file is renamed; evidence belongs in the A4 approval-gate conversation
(`core/commands/code.md`), not in the persisted document.

## File: specs/tech-stack.md

Fixed `##` sections, in order:

- **Languages & runtimes** — versions matter (e.g. "Node.js >= 20"); read
  them from the source (`engines` field, CI matrix, etc.) but state them
  plainly — don't cite the source file/line in this document, since a
  version bump or config move would leave the citation wrong.
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

- **Now** — what is actively being worked on, right now, *on this branch*.
  One line per in-flight feature/bugfix, in this exact shape:
  `- <title> — branch \`<branch>\` — specs/features/<slug>.md`. This section
  is deliberately per-branch, not a cross-branch dashboard: it reflects
  whatever `specs/features/*.md` files with `branch:` matching the current
  checkout say is in flight. There is no reconciliation step that scans
  other branches. `<slug>` here is the item's roadmap slug (see
  [Item slugs](#item-slugs) below) — it's already stable and unique, since
  it doubles as the feature spec's filename.
- **Next** — what is planned to start once "Now" items land. One line per
  item: `- \`<slug>\` — <title>`.
- **Later** — directional, lower-confidence future work; fine to be sparse.
  Same shape as Next: `- \`<slug>\` — <title>`.
- **Out of scope** — ideas explicitly considered and deferred or rejected,
  and why. One line per item: `- \`<slug>\` — <title> — <reason>`.

The exception to evidence-grounding: roadmap is inherently forward-looking,
so most of it comes from the user, not the repo. Never invent roadmap items;
include only what the user has actually said, or what is unambiguously
already in motion (e.g. an open PR).

### Item slugs

Every roadmap item gets a short kebab-case slug (e.g. `telemetry-prod-default`),
assigned once — when it first enters the roadmap, in `Next` or `Later` — and
never changed for as long as the item exists in any section, so it can be
referenced later (by the user or by `/code`) without copy-pasting its title
or description. Slugs are unique across the whole file, in every section.

When a `Next`/`Later` item is promoted into a feature spec at B1 (per the
`feature-spec-format` skill), reuse its roadmap slug as the spec's `<slug>`
instead of deriving a new one from the title — this is what keeps the `Now`
line's `specs/features/<slug>.md` pointer consistent with the slug the item
carried in `Next`/`Later`.

### Moving an item between sections

An item, identified by its slug, exists in **at most one** of
`Now`/`Next`/`Later`/`Out of scope` at any time. Moving it is a single edit:
delete its line from the old section and add it (same slug, reformatted for
the destination section's shape) to the new one, in that same change — never
leave it listed in two sections at once, even temporarily. This applies to
every move: `Next` <-> `Later`, either of those -> `Out of scope`, an
`Out of scope` item revived back into `Later`/`Next`, and `Next` -> `Now`
(the last one keeps the exemption described below).

Only `Next` <-> `Now` is mechanical bookkeeping exempt from the update-gate.
Every other move — `Next` <-> `Later`, anything into or out of
`Out of scope` — is a real change to roadmap direction and goes through the
full [Updating an existing (approved) file](#updating-an-existing-approved-file)
gate; the no-duplication rule above still applies inside that gated edit.

### `## Now` line lifecycle (the exempt `Next` <-> `Now` move)

Adding or removing a `## Now` line for a feature/bugfix is mechanical
bookkeeping tied to a decision the human already approved elsewhere — it is
**not** a roadmap-direction change, and does not go through
[Updating an existing (approved) file](#updating-an-existing-approved-file):

- **Added** by `/code`'s B2 (feature implementation start), once the
  branch-strategy question is answered and the feature spec's `branch:`
  field is set. Per [Moving an item between sections](#moving-an-item-between-sections),
  remove the matching `## Next` line for the same slug in the same edit.
- **Removed** by `/code`'s B5 (documentation update), in the same edit that
  adds the `CHANGELOG.md` entry — the work is no longer "current," it's in
  the changelog. Also removed if a human ever sends `status` backward out of
  `implementing` (abandoned/rejected), so `Now` never shows stale work. This
  does not restore a `## Next`/`## Later` line — the item is done or dropped,
  not deferred; dropped work belongs in `Out of scope` if the user wants it
  tracked, added there as its own edit.

Both edits ride along B1's and B5's own approval gates; they don't bump
`version` or need a separate one.

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
