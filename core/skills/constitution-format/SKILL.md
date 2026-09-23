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

### Artifacts

An optional `### Artifacts` subsection nested inside `## Infrastructure &
tooling` (not a new top-level `##` section — the fixed `##` list above is
exact and order-enforced by `scripts/validate-specs.js`'s `checkSections`;
a `###` subheading is invisible to that check, so adding this subsection
never breaks an existing `tech-stack.md`). It declares every artifact the
project produces — a published package, a deployed service or app, anything
with its own release/consumer surface — so `/code`'s later phases can tell
which changelog file(s) a given change needs an entry in.

A table with these columns:

- **Artifact** — the published or deployed name.
- **Root** — the repo-relative directory the artifact is built from; `.` for
  the artifact rooted at the repo itself.
- **Changelog** — the repo-relative path to that artifact's changelog,
  normally `<Root>/CHANGELOG.md`.
- **Versioning** — one of `lockstep`, `independent`, or `none`, optionally
  followed by a parenthetical naming the file(s) that hold the version, e.g.
  `lockstep (package.json, agent-tools.yaml)`. `none` covers an artifact with
  no version field anywhere — its changelog may legitimately stay
  `## [Unreleased]` forever.
- **Roadmap** — the repo-relative path to that artifact's own roadmap file,
  normally `specs/artifacts/<artifact-name>/roadmap.md` for a genuinely
  separate artifact — unlike `Changelog`, `roadmap.md` has no external
  consumer (no npm page, no GitHub-browsing convention) that expects to
  find it at the artifact's own code root, so it stays under `specs/`
  instead of mixing a planning file into a code directory, while `specs/
  artifacts/<name>/` keeps it in one recognizable, predictable place
  without needing this table to find it. Optional; see the implicit
  default below for what an empty cell or an absent column means.

Directly under the table, an optional free-prose `Built from:` line records
build fan-out — e.g. "the three `packages/*` artifacts are assembled from
`core/` by `scripts/build.js`; a change under `core/` reaches all four
artifacts." This is what lets a later mapping step know a change under one
artifact's root also needs entries in the artifacts it feeds.

**Implicit default:** when this subsection is absent from a project's
`tech-stack.md`, the project has exactly one artifact — root `.`, changelog
`CHANGELOG.md`, versioning unspecified. This is the common case, and it must
require zero new ceremony: omit the subsection entirely for a single-artifact
project rather than adding an empty or placeholder one.

**Roadmap column default:** the same implicit-default pattern applies at the
column level. An empty cell in the `Roadmap` column, or the column being
absent from the table entirely, means that artifact's roadmap is the
specs-root `roadmap.md` — never a missing value that needs to be chased down
or filled in.

This is not symmetric with `Changelog`. A project may specify `Changelog` per
row even when versioning is shared — this repo's own table below does
exactly that, giving every artifact its own changelog file even though all
four release in lockstep. `Roadmap` is expected to be omitted far more often,
because a project can independently choose to share one roadmap while still
wanting separate changelogs, or vice versa. The two columns answer different
questions — what ships to whom, versus what one team is planning — so
collapsing one column says nothing about the other.

**Example — lockstep npm packages** (this repo's own eventual shape: one
version bump touches root plus every `packages/*` package, and all four
share one roadmap, so the table below has no `Roadmap` column at all):

| Artifact | Root | Changelog | Versioning |
| --- | --- | --- | --- |
| `@dpurge/agent-tools` | `.` | `CHANGELOG.md` | lockstep (`package.json`, `agent-tools.yaml`) |
| `@dpurge/claude-agent-tools-plugin` | `packages/claude-agent-tools-plugin` | `packages/claude-agent-tools-plugin/CHANGELOG.md` | lockstep (`package.json`, `agent-tools.yaml`) |
| `@dpurge/opencode-agent-tools-plugin` | `packages/opencode-agent-tools-plugin` | `packages/opencode-agent-tools-plugin/CHANGELOG.md` | lockstep (`package.json`, `agent-tools.yaml`) |
| `@dpurge/pi-agent-tools-extension` | `packages/pi-agent-tools-extension` | `packages/pi-agent-tools-extension/CHANGELOG.md` | lockstep (`package.json`, `agent-tools.yaml`) |

Built from: the three `packages/*` artifacts are assembled from `core/` by
`scripts/build.js`; a change under `core/` reaches all four artifacts.

**Example — no-version monorepo of independently-evolving apps** (a sibling
project's shape: several apps, no per-app `package.json` or version field at
all, each with its own roadmap too):

| Artifact | Root | Changelog | Versioning | Roadmap |
| --- | --- | --- | --- | --- |
| `knowledge` | `knowledge/` | `knowledge/CHANGELOG.md` | none | `specs/artifacts/knowledge/roadmap.md` |
| `phraseforge` | `phraseforge/` | `phraseforge/CHANGELOG.md` | none | `specs/artifacts/phraseforge/roadmap.md` |
| `dictionary` | `dictionary/` | `dictionary/CHANGELOG.md` | none | `specs/artifacts/dictionary/roadmap.md` |

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
scope only, then apply the `doc` skill's method to produce an
evidence-linked account of what changed and why (drift found vs. code, or new
direction from the user) before presenting it for approval. On approval,
increment `version`, set `updated`, and keep `status: approved`.
