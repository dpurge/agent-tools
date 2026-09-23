---
name: code
description: Spec-driven development workflow. Establishes the project constitution (mission, tech stack, roadmap) under specs/, then drives every feature/bugfix through specification, implementation, validation, and documentation, with human approval on key changes.
version: 1.0.0
agents:
  - researcher
  - technical-writer
  - coordinator
  - architect
  - engineer
  - tester
  - reviewer
skills:
  - constitution-format
  - feature-spec-format
  - memory-format
  - doc
  - code-review
  - architecture-review
  - security-review
---

# Code Workflow

This workflow is runnable as the `/code` slash command. The authoritative,
step-by-step instructions live in
[`core/commands/code.md`](../commands/code.md) so there is a single source of
truth.

## When to use

- starting spec-driven development on a project that has no `specs/`
  constitution yet
- starting on a project whose `specs/` already means something else — see
  Part A's specs-root resolution below
- checking whether a project's constitution is complete, or revisiting an
  approved constitution file that's gone stale
- implementing a feature or fixing a bug once a constitution exists — this
  is the toolkit's home for that work, replacing the retired
  `/feature-development` command

## Ground rules (both parts)

- **Small, observable steps** — narrate before doing, validate after, get a
  go-ahead before the next one. Applies inside a phase, especially B2, not
  just between phases.
- **Model tiering** — `coordinator`/`architect`/`reviewer` (planning,
  architecture, coordination) use big, capable models; `engineer`/`tester`/
  `researcher`/`technical-writer` (mechanical implementation, validation,
  research, write-up) use smaller ones. Intentional, not a shortcut.
  `coordinator` dispatches small, well-scoped chunks, not one large task.
- **`.agent/tmp/`** for scratch files, never the specs root (`agent-workspace`
  rule).
- **Memory** — `<specs-root>/memory.md` is a shared, grep-only, append-only
  log of durable cross-session knowledge (`memory-format` skill). Never
  read in full.
- **Git/delivery** — never commit, push, or open a PR without explicit human
  approval; always draft the commit message/PR description for review first;
  never add model or tool attribution anywhere.

## Phases (summary)

### Part A — Constitution

0. **Resolve the specs root** — if `specs/` doesn't exist, use it. If it
   exists and passes `validate-specs`, use it. If it exists but fails, fall
   back to `.agent/specs/` (generating it from scratch if needed, or using it
   as-is if a prior session already set it up and it passes validation) —
   never overwrite an incompatible `specs/`. If `.agent/specs/` also fails,
   stop and ask the user rather than guessing. See `core/commands/code.md`
   A0 and the `agent-workspace` rule. Every later `validate-specs` call in
   this workflow means against `<specs-root>` — pass `--dir=.agent/specs`
   explicitly whenever that's what A0 resolved to; checking the default
   `specs/` instead silently skips validating (including secret-scanning
   `memory.md`) the directory actually in use.
1. **Check status** — does `<specs-root>/{mission,tech-stack,roadmap}.md`
   exist and carry `status: approved`?
2. **Gather evidence** — one `researcher` pass covering every missing/draft
   file; roadmap content comes primarily from the user, never invented.
3. **Draft** — one `technical-writer` pass, per the `constitution-format`
   skill's exact templates.
4. **Approval gate** — human reviews as a narrative and explicitly approves
   before anything is written with `status: approved`.
5. **Write** — only approved files are written.
6. **Update path** — an approved file can later be revisited: re-gather
   evidence for that file only, apply the `doc` skill to produce an
   evidence-linked change narrative, and only write on approval. Also the
   landing point for **replanning** triggered from Part B.

### Part B — Feature/bugfix loop

One persistent file per feature/bugfix, `<specs-root>/features/<slug>.md`,
in the exact format the `feature-spec-format` skill defines. Only
`technical-writer` writes it, at every phase, transcribing what the
read-only specialists and `engineer` report. `node scripts/validate-specs.js`
runs after every write, in every phase.

0. **Understand the request** — if what's wanted is empty, vague, or
   ambiguous in a way that would change the outcome, ask before proceeding;
   then decide whether this needs the constitution updated, a feature spec
   created/updated, or both, and route accordingly.
1. **Feature specification** — the feature's slug reuses an existing
   `Next`/`Later` item's slug from any declared roadmap file, not just the
   specs-root one, when present; `researcher` gathers context, notes
   unknowns, and greps `memory.md` for relevant entries; ask up to ~5
   priority-ordered questions to resolve ambiguity before designing;
   `architect` sketches the approach (ordered plan, trade-offs,
   risks/security/testing strategy, via `architecture-review`/
   `security-review`) when a design decision is needed; check for
   replanning (does this need a constitution change? if so, detour into
   Part A's update path first); `technical-writer` writes the spec.
   **HITL** — human approves before implementation starts.
2. **Feature implementation** — establish a clean baseline first (`git
   status`/`git branch`, and `tester` runs the real suite once before any
   change — never discard uncommitted work found here), adding this
   feature's `## Now` line to each roadmap file resolved the same
   longest-prefix way phase 4 maps changelogs; `engineer` greps
   `memory.md` for relevant `[build]`/`[gotcha]` entries, then implements
   per the approved approach in small, narrated steps (not one silent
   pass), following project conventions; writes tests covering the
   acceptance criteria (isolated, deterministic, idempotent); self-reviews
   with `code-review`/`security-review` before handing off; appends any
   durable learning to `memory.md`. A real divergence from the approved
   approach is itself a replanning trigger, not something to push through.
3. **Feature validation** — `tester` runs the real suite (including the new
   tests) and reports pass/fail/regressions, checking `memory.md` for known
   causes on failure; `reviewer` is invoked when the change warrants a
   second pair of eyes, not on every change.
4. **Documentation review** — `technical-writer` applies `doc`
   against affected docs and the constitution files; drift in a constitution
   file is replanning too. For `CHANGELOG.md`, `technical-writer` first maps
   each *Affected Areas* path to its owning changelog(s) via `tech-stack.md`'s
   optional `### Artifacts` table (longest-prefix, segment-aware, plus any
   `Built from:` fan-out — a single implicit root artifact when the table is
   absent), flags unmatched paths as their own finding, and records a
   `{changelog path, category, entry}` list per artifact for B5 to consume.
5. **Documentation update** — approved doc changes are applied, each
   changelog entry written into the specific file B4 named (creating it at
   that artifact's own root if missing), and this feature's `## Now` line
   removed from each roadmap file it was added to in phase 2 (resolved the
   same way); constitution changes are already handled by their own gate;
   any remaining durable learning is appended to `memory.md`. `coordinator`
   checks `memory.md`'s entry count (via `Grep` count, since it has no
   `Bash`) and dispatches `technical-writer` to purge/consolidate past 200
   entries — autonomous, reported to the human, not gated. A commit message
   (and PR description, if applicable) is drafted for human review.
   **HITL** — human approves final delivery, and separately, before
   anything is actually committed or opened.

## Roles

- `researcher` — read-only evidence gathering (existing repo, docs, git,
  and `memory.md` via `Grep`).
- `technical-writer` — the sole writer of every specs-root file except
  `memory.md` (`engineer` may also append there directly), in both parts;
  write permission, but only writes formal specs after explicit approval
  for key changes. Also the one who runs `memory.md`'s purge/consolidation
  pass.
- `coordinator` — drives the feature/bugfix loop, delegates each phase in
  small chunks, owns the HITL checkpoints, and checks `memory.md`'s entry
  count. Read-only; does not design, implement, test, or document itself.
- `architect` — sketches the approach when a feature needs a design
  decision before it can be specified. Read-only.
- `engineer` — implements the approved approach one small step at a time,
  writes the tests for it, self-reviews before handoff, and appends
  durable learnings to `memory.md`. Read/write/edit/bash.
- `tester` — runs the real test/build commands, both as B2's pre-work
  baseline and B3's post-work verification; reports results, never fixes
  them. Read-only plus `Bash`.
- `reviewer` — critiques a feature when `coordinator` judges it warrants a
  second pair of eyes. Read-only.

File format — frontmatter keys, section headings, and drafting/update rules
— is owned entirely by the `constitution-format` skill (Part A), the
`feature-spec-format` skill (Part B), and the `memory-format` skill
(`memory.md`, both parts); this workflow and its command don't restate any
of them.

**Talking to the user, throughout Part B:** ask the question, explain the
reasoning briefly, suggest the option you'd pick — short, and always open to
follow-up, never a closed form.

## Success criteria

- `<specs-root>/mission.md`, `<specs-root>/tech-stack.md`,
  `<specs-root>/roadmap.md` exist, match the `constitution-format` skill's
  templates, and are marked `status: approved` — where `<specs-root>` is
  `specs/` unless it was incompatible, per A0.
- Every `<specs-root>/features/*.md` file matches the `feature-spec-format`
  skill's templates at every point in its lifecycle, and passes
  `node scripts/validate-specs.js`.
- A pre-existing, incompatible `specs/` directory is never overwritten;
  `.agent/specs/` (never committed) is used instead, and the user is told
  which one is in play.
- Every non-roadmap constitution claim is evidence-backed; roadmap content
  reflects what the user actually said, not invention.
- No constitution file, and no feature spec's key changes (specification,
  final delivery, any constitution-affecting change), is written or advanced
  without an explicit human approval step.
- No commit, push, or pull request happens without a separate, explicit
  human approval of the drafted message/description — and never with model
  or tool attribution.
- High-impact ambiguities are resolved with the user before a spec is drafted,
  not discovered after.
- Every feature has a captured pre-implementation baseline, tests covering
  its acceptance criteria, is self-reviewed by `engineer`, and is verified by
  `tester` against the real test/build commands before being called done.
- `<specs-root>/memory.md`, if present, matches the `memory-format` skill's
  fixed header and one-line entry shape, contains no secret or
  non-portable-path pattern, and never exceeds ~200 entries for long
  without a reported purge/consolidation pass.
