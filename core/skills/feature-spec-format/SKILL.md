---
name: feature-spec-format
description: Canonical file format for a single feature or bugfix — specs/features/<slug>.md — that persists across the /code feature/bugfix loop (specification, implementation, validation, documentation review, documentation update).
version: 1.0.0
---

# Feature Spec File Format

## Purpose

One file per feature or bugfix, at `specs/features/<slug>.md`, that the
`/code` feature/bugfix loop reads and updates in place as the work moves
through its phases. Fixed frontmatter and section list so the format stays
checkable by `scripts/validate-specs.js` — this matters more here than for
most docs, because the model drafting or updating this file is often small
and not very capable, and a rigid, flat structure is what keeps that
reliable.

`scripts/validate-specs.js` enforces the exact frontmatter keys and section
list below. If you change either here, update that script's
`FEATURE_SECTIONS`/`FEATURE_STATUSES`/`FEATURE_KINDS` constants to match —
they are kept in sync by hand, not derived from each other.

## Slug and location

`specs/features/<slug>.md` — `<slug>` is a short, kebab-case name derived
from the title (e.g. `oauth-login`, `fix-cache-race`). Pick a slug once and
never rename the file after `status` leaves `draft` — other documents and
conversation history may already reference it by that path.

## Frontmatter

```yaml
---
title: Add OAuth login       # short, human-readable
kind: feature                 # feature | bugfix
status: draft                 # draft | approved | implementing | validating | documenting | done
version: 1                    # int, starts at 1, incremented on each approved change to Specification
updated: YYYY-MM-DD            # ISO date of the last write
---
```

`status` only moves forward along
`draft → approved → implementing → validating → documenting → done`, except
when a human sends it back (e.g. rejecting an implementation approach — back
to `approved`, or worse, back to `draft`). Never skip a state to save a step.

## Sections

Fixed `##` sections, in this exact order, nothing else:

1. **Problem / Motivation** — what's wrong or missing, and why it matters.
2. **Acceptance Criteria** — concrete, checkable conditions for "done."
3. **Approach** — the chosen implementation approach and key decisions.
4. **Affected Areas** — files, modules, or docs this is expected to touch.
5. **Out of Scope** — what this feature/bugfix deliberately does not cover.
6. **Implementation Notes** — filled in during implementation: what was
   actually done, file paths touched, any deviation from the approved
   Approach (and why).
7. **Validation** — filled in during validation: exact test/build commands
   run, pass/fail, regression vs. pre-existing failures, coverage gaps.
8. **Documentation Review** — filled in during doc review: which docs were
   checked against this change (including constitution files) and what
   drift, if any, was found.
9. **Documentation Updates** — filled in during doc update: what was
   actually changed, where, and — if this feature required a constitution
   change — a pointer to that update instead of duplicating it here.

Sections 1–5 are written (and approved) before implementation starts;
sections 6–9 start empty and are filled in as the corresponding phase
completes. Never delete a section for not having content yet — write "Not
started." instead, so the file always has the full fixed shape.

## Writing rules

- Only `technical-writer` writes this file, at every phase — it transcribes
  what the read-only specialists (`researcher`, `architect`, `tester`,
  `reviewer`) reported, and what `engineer` did, rather than each of them
  writing directly. This keeps one consistent writer and keeps the other
  roles' read-only tool grants meaningful.
- Run `node scripts/validate-specs.js` (or `agent-tools validate-specs`)
  immediately after every write to this file. Fix and re-validate before
  moving on — don't let a malformed file accumulate through several phases.
- `version` increments only on a change to sections 1–5 (the approved
  specification itself); sections 6–9 filling in as work progresses do not
  bump it.

## Replanning

If, during any phase, the approved Approach turns out to conflict with or
require changing `specs/mission.md`, `specs/tech-stack.md`, or
`specs/roadmap.md`: stop, and route through that constitution file's update
path (see `constitution-format` skill) before continuing this file. Note the
outcome in **Documentation Updates** with a pointer to the constitution
file, rather than duplicating the change here.
