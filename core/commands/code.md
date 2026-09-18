---
description: Spec-driven development entry point. Establishes the project constitution, then drives feature/bugfix work through specification, implementation, validation, and documentation, with human approval on key changes.
argument-hint: [optional: constitution direction, or the feature/fix to work on]
---

# Code

`/code` is the entry point for spec-driven development in this project.
Specs persist across sessions under a **specs root** — normally `specs/` at
the project root, but see [A0](#a0-resolve-the-specs-root) for what happens
when a project already has an incompatible `specs/`. There are two parts:
establish the **constitution** once, then drive every feature or bugfix
through the **feature/bugfix loop**. Run `node scripts/validate-specs.js`
(or `agent-tools validate-specs`) immediately after every write under the
specs root, in both parts — the model drafting these files is often small
and not very capable, and this catches a malformed file before it compounds
across phases. **Every "run `validate-specs`" instruction below means run it
against `<specs-root>`** — pass `--dir=<specs-root>` explicitly whenever
`<specs-root>` isn't the default `specs/` (i.e. whenever A0 resolved to
`.agent/specs/`). Checking the wrong directory silently skips validating
the one actually in use, including its secret/portability scanning of
`memory.md` — don't let that happen.

**Direction from the user (optional):** $ARGUMENTS

## 0. Understand the request

Before doing anything else that depends on knowing what's wanted: if the
request is empty, vague, or ambiguous in a way that would change the
outcome, ask before proceeding — don't guess. Once it's clear, decide
whether it needs the constitution updated, a feature/bugfix spec
created or updated, or both, and route to the matching part(s) below.
(Resolving the specs root in [A0](#a0-resolve-the-specs-root) doesn't need
this — it's mechanical and read-only — but everything past it does.)

## Ground rules

These apply throughout, both parts:

- **Small steps, always observable.** Don't do a big change in one silent
  pass. Tell the user what you're about to do, do it, validate it, record
  it, tell the user what happened, get a go-ahead, then move on. This
  applies inside a phase, not just between phases — see
  [B2](#b2-feature-implementation) for where it matters most.
- **Model tiering.** `coordinator`, `architect`, and `reviewer` do the
  planning, architecture, and coordination — use big, capable models there.
  `engineer`, `tester`, `researcher`, and `technical-writer` do mechanical
  implementation, validation, research, and write-up once that thinking is
  done — smaller/cheaper models are the right fit there, and this is
  intentional, not a quality shortcut. `coordinator` should hand each of
  these roles small, well-scoped chunks rather than one large task, to keep
  both context and cost down.
- **Scratch files** an agent needs only for the current step go in
  `.agent/tmp/` (see the `agent-workspace` rule) — never in the specs root,
  never relied on by a later session.
- **Memory.** `<specs-root>/memory.md` is a shared, grep-only log of durable
  cross-session knowledge — see the `memory-format` skill for the exact
  format, who may append, and how it's maintained. Never read it in full;
  consult it with `Grep`/`tail`.
- **Git and delivery.** Never `git commit`, push, or open a pull request
  without the human explicitly approving that specific action. Always draft
  the commit message or PR description and present it for review first —
  don't just describe the change, show the actual proposed text. **Never**
  add model or tool attribution anywhere: not in commits, PR descriptions,
  code comments, or docs.

---

## Part A — Constitution

Constitution files (`mission.md`, `tech-stack.md`, `roadmap.md`, under the
specs root) follow the exact format defined by the `constitution-format`
skill — apply it for every frontmatter key, section heading, and
drafting/update rule below; this command does not restate it. `memory.md`
(see `memory-format`) resolves under the same specs root, once A0 below
determines what that is.

### A0. Resolve the specs root

Figure out which directory is `/code`'s specs root for the rest of this
session — call it `<specs-root>`. Every reference below to, e.g.,
`mission.md` means `<specs-root>/mission.md`.

1. **`specs/` doesn't exist yet** → `<specs-root>` = `specs/`. Continue to
   A1.
2. **`specs/` exists** → run `validate-specs` against it
   (`agent-tools validate-specs` or `node scripts/validate-specs.js`).
   - **No errors** → `<specs-root>` = `specs/`. Continue to A1.
   - **Errors** — this project's `specs/` predates `/code` or means
     something else and doesn't follow the required format. Check
     `.agent/specs/` (see the `agent-workspace` rule):
     - **Doesn't exist** → tell the user plainly, e.g.: "`specs/` exists
       but isn't in `/code`'s format, so `/code`'s own specs will live
       under `.agent/specs/` instead — your `specs/` is untouched." Ensure
       `.gitignore` covers `.agent/`, then read whatever's in `specs/` as
       extra (best-effort — it may have nothing usable) research input and
       run the normal constitution build ([A2](#a2-gather-evidence)–
       [A5](#a5-write)) with `<specs-root>` = `.agent/specs/`.
     - **Exists, and passes `validate-specs --dir=.agent/specs`** →
       `<specs-root>` = `.agent/specs/` (set up in an earlier session).
       Continue to A1.
     - **Exists, but fails too** → **stop.** Report to the user, with the
       specific errors, that neither `specs/` nor `.agent/specs/` is usable,
       and ask how they want to proceed. Do not guess or silently pick one.

### A1. Check status

Read `<specs-root>/mission.md`, `<specs-root>/tech-stack.md`,
`<specs-root>/roadmap.md`.

- **All three exist with `status: approved`** → the constitution is
  established. If the user's direction (`$ARGUMENTS`) or the conversation
  asks to revisit one, go to
  [Updating an approved file](#updating-an-approved-file). Otherwise, go to
  [Part B — Feature/bugfix loop](#part-b--featurebugfix-loop).
- **Any file is missing, or exists with `status: draft`** → continue below.

### A2. Gather evidence

Make **one** `researcher` agent (read-only) call covering every missing or
draft file together — mission, tech stack, and roadmap questions typically
draw on the same sources (README, manifests, CI config, existing docs), so
gather once rather than per file:

- **Mission:** what does this project do today, what problem does the code
  solve, who or what consumes it? Quote `path:line` for every claim.
- **Tech stack:** languages, runtimes, frameworks, key libraries, build
  tooling, CI/CD, deployment targets — read manifests/lockfiles/CI configs,
  don't infer from vibes.
- **Roadmap:** open TODOs, `docs/TODO.md`-style files, half-finished code
  paths, and anything the user has already stated in this conversation about
  what's next. Roadmap is the one file that is mostly user-authored, not
  evidence-grounded — never invent items; include only what the user said or
  what is unambiguously already in motion (e.g. an open PR).

### A3. Draft

Make **one** `technical-writer` agent call to draft (or update) every
missing/draft file from the evidence above, per the `constitution-format`
skill's templates. Run `validate-specs` immediately after writing.

### A4. 🚦 Approval gate — constitution

Present the drafted (or updated) file(s) to the user as a short narrative,
not a raw dump: what each section says and why, and which claims came from
evidence versus from the user directly. **Stop and wait** for explicit
approval. Treat questions or edits as review feedback; iterate until approved.

### A5. Write

Once approved: set `status: approved` and `updated` to today's date, write
each file to `<specs-root>/<name>.md` (create `<specs-root>` if needed), run
`validate-specs`, confirm to the user which file(s) were written, then
continue to [Part B](#part-b--featurebugfix-loop) if the user has work in
mind.

Only files the user approved get `status: approved`. If the user approves
mission and tech stack but wants to keep iterating on roadmap, write the
first two as approved and leave roadmap `draft` (or unwritten) until it's
approved too.

### Updating an approved file

When the user asks to revisit an approved file (or `$ARGUMENTS` implies one
has gone stale) — and also when [Part B](#part-b--featurebugfix-loop) detours
here for **replanning**:

1. Read the current file as-is — do not discard its content.
2. Re-run [A2. Gather evidence](#a2-gather-evidence) for just that file's
   scope.
3. Apply the `doc-review` skill's method to produce an evidence-linked
   account of what would change and why, and present it to the user (per the
   `constitution-format` skill's update rules).
4. On approval: increment `version`, set `updated`, keep `status: approved`,
   write, run `validate-specs`. If the user only partially approves the
   proposed change, apply just the approved part and note what was left
   alone.
5. If this was reached via a Part B detour, return to the step in the
   feature/bugfix loop that triggered it, now consistent with the updated
   constitution.

Never silently rewrite an approved constitution file without this review
step, even if new evidence contradicts it.

---

## Part B — Feature/bugfix loop

Once the constitution exists and the user has a concrete feature or bugfix
in mind (from `$ARGUMENTS` or the conversation), `coordinator` drives it
through five phases, all recorded in one persistent file:
`<specs-root>/features/<slug>.md`, in the exact format the
`feature-spec-format` skill defines — apply that skill for every frontmatter
key, section, and rule below; this command does not restate it. If there's
no concrete feature or bugfix in mind yet, ask the user what to work on
before starting B1 — don't guess.

`<slug>` is a short kebab-case name derived from the title (e.g.
`oauth-login`, `fix-cache-race`). If resuming existing work, read the
existing file instead of starting a fresh one — its `status` says which
phase to resume at.

**Only `technical-writer` writes to this file**, at every phase — it
transcribes what the read-only specialists (`researcher`, `architect`,
`tester`, `reviewer`) reported and what `engineer` did, rather than each of
them writing directly. This keeps one consistent writer and keeps the other
roles' read-only tool grants meaningful. Run `validate-specs` after every
write to this file, in every phase below.

**Key changes are always approved by the human; routine ones aren't.** The
mandatory checkpoints are: approving the specification (B1) and approving
final delivery (B5). Anything that changes the constitution (replanning, see
below) is also always gated, wherever it happens. Filling in Implementation
Notes, Validation, or non-constitution documentation updates does not need
its own checkpoint — those are the routine record of work already approved
in principle at B1. Within B2 specifically, apply the small-steps ground
rule even between checkpoints — see there.

### B1. Feature specification

1. `researcher` gathers the context needed: affected files, modules, and
   dependencies; existing patterns and conventions to follow; and a
   targeted `Grep` of `memory.md` for the affected area or tag — report any
   relevant entries found, don't read the file in full. Note unknowns
   explicitly rather than guessing past them.
2. **Ask questions.** Before designing, resolve the ambiguities that would
   change the outcome: up to ~5 focused questions, highest-impact first
   (scope, then security, then UX, then details); one decision per
   question, with a safe default stated for each. If the user doesn't know,
   record it as an assumption (in *Problem / Motivation*, once drafted) and
   continue. Do not proceed past unresolved **critical** unknowns.
3. `architect` sketches the approach when the work needs a design decision,
   not just a mechanical change — applying the `architecture-review` skill,
   and `security-review` when anything security-relevant is involved. The
   approach should cover: the chosen approach and key decisions, with
   trade-offs and alternatives considered; an ordered implementation plan
   (steps and affected files); and, when relevant, risks, security
   implications, and the testing strategy. Keep it as simple as the
   requirements allow.
4. **Replanning check:** if the approach conflicts with, or requires
   changing, the constitution, stop here and run
   [Updating an approved file](#updating-an-approved-file) for the affected
   file(s) **before** finalizing the spec below — the feature spec should be
   written consistent with the (possibly updated) constitution, not the
   other way around.
5. `technical-writer` writes `<specs-root>/features/<slug>.md` with sections
   *Problem / Motivation*, *Acceptance Criteria*, *Approach*, *Affected
   Areas*, *Out of Scope* filled in (the ordered plan and any risks/testing
   strategy from step 3 go in *Approach*); the later sections say "Not
   started.". `status: draft`. Run `validate-specs`.
6. **🚦 HITL — approve the spec.** Present it as a short narrative: the
   problem, the chosen approach and why, and any open assumptions from
   step 2 — not a raw dump. **Stop and wait** for explicit approval; iterate
   on edits until approved. On approval, set `status: approved`, run
   `validate-specs`.

### B2. Feature implementation

1. **Establish a clean baseline.** Run `git status` and `git branch` to see
   what's already there and confirm which branch this lands on. `tester`
   runs the project's real test/build commands once, before touching
   anything — this is the baseline B3 compares against (regression vs.
   pre-existing failure). If `git status` shows uncommitted changes:
   **never discard them.** Tell the user what's there; only if a clean tree
   is genuinely needed for a trustworthy baseline, offer to `git stash` with
   a clearly labeled, recoverable message, and only with the user's
   go-ahead — otherwise proceed on top of what's already there.
2. `engineer` greps `memory.md` for `[build]`/`[gotcha]` entries relevant to
   the *Affected Areas* before starting, then implements per the approved
   *Approach*, staying inside *Affected Areas* and *Out of Scope*, following
   the project's existing conventions and coding-style rules. Keep the
   build green; report real results.
3. **Work in small, observable steps.** If the *Approach*'s ordered plan has
   more than one real step, don't implement them all in one silent pass:
   for each step, tell the user what you're about to do, do it, validate it
   (the relevant slice of the test/build commands), record it, tell the
   user what happened, and get a quick go-ahead before the next one. This is
   also where the model-tiering ground rule matters most — `coordinator`
   hands `engineer` one small step at a time rather than the whole
   *Approach* at once.
4. If the real shape of the work diverges from the approved *Approach* in a
   way that matters, stop — that's a plan change, not routine
   implementation. Treat it like a replanning trigger: get it approved
   (adjust B1's *Approach* and re-approve, or escalate to the human directly)
   before continuing.
5. `engineer` writes tests covering the *Acceptance Criteria* and important
   edge cases; tests must be isolated, deterministic, and idempotent.
6. `engineer` self-reviews with the `code-review` skill — and
   `security-review` when the change is security-sensitive — before handing
   off. This always happens, regardless of whether B3 also invokes the
   `reviewer` agent.
7. If `engineer` learned something durable and reusable beyond this one
   feature (a build quirk, a convention, a gotcha) — not just what went in
   *Implementation Notes* — append it to `memory.md` directly, per the
   `memory-format` skill's rules (portable, safe to commit, a fact not an
   instruction).
8. `technical-writer` records what was actually done, step by step, and the
   tests added, in *Implementation Notes*, sets `status: implementing`, runs
   `validate-specs`.

### B3. Feature validation

1. `tester` runs the real test/build commands and reports pass/fail, with
   exact output for any failure, and whether it's a regression against
   B2's baseline or pre-existing.
2. On failure: grep `memory.md` for `[gotcha]` entries mentioning the
   failing command first — it may be a known issue with a known cause.
   Then, back to [B2](#b2-feature-implementation) to fix forward
   (bounded — don't loop silently forever), or escalate to the human with
   what's blocking it.
3. `reviewer` is invoked when the change is security-sensitive or
   architecturally significant, not on every feature — `coordinator`'s call.
4. `technical-writer` records the results in *Validation*, sets
   `status: validating`, runs `validate-specs`.

### B4. Documentation review

1. `technical-writer` applies the `doc-review` skill against the docs this
   feature could have affected — README, `CHANGELOG.md`, other project docs,
   **and** the constitution files — looking for drift this change caused.
   For `CHANGELOG.md`, drift also means a missing entry: any user-facing
   change (behavior, CLI surface, config, public API) needs one under
   `## [Unreleased]`; a purely internal change (refactor, test-only,
   docs-only) does not.
2. If drift touches a constitution file, that's replanning too: run
   [Updating an approved file](#updating-an-approved-file) for it, gated by
   the human like any other constitution change.
3. Record findings in *Documentation Review*, set `status: documenting`, run
   `validate-specs`.

### B5. Documentation update

1. `technical-writer` applies the approved documentation changes (README,
   other docs; constitution changes are already handled by their own gate
   in B4). If B4 flagged a missing `CHANGELOG.md` entry, add one now: under
   `## [Unreleased]`, in the matching
   [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) category
   (`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security`), one
   line, user-facing, sourced from *Acceptance Criteria*/*Implementation
   Notes* — never invented. If the project has no `CHANGELOG.md` yet, create
   it at the project root with the standard Keep a Changelog header and an
   empty `## [Unreleased]` before adding the entry. Record what changed,
   where, in *Documentation Updates* — for a constitution change, point to
   it rather than duplicating it here.
2. If anything durable and reusable surfaced during this feature that
   didn't already get appended in B2 (e.g. a documentation-review finding
   worth remembering), `technical-writer` appends it to `memory.md` now,
   per the `memory-format` skill.
3. **Check the memory threshold.** `coordinator` runs a `Grep` with
   `output_mode: "count"` for `^\d{4}-` against `memory.md` (it has no
   `Bash`, so this is the check, not `wc -l`). Past 200 entries, dispatch
   `technical-writer` to purge/consolidate per the `memory-format` skill's
   maintenance rules — autonomous, no approval gate, but relay its report
   (entries before/after, what was removed and why) to the human in the
   delivery summary below.
4. Set `status: done`, run `validate-specs`.
5. Draft the commit message (and PR description, if this is going through a
   PR) for the human to review — per the git ground rule, this is a draft
   to approve, never an action taken on its own.
6. **🚦 HITL — approve final delivery.** `coordinator` presents a short
   summary: what changed and why, how it was validated, any documentation
   or constitution changes, **every `memory.md` entry appended during this
   feature, quoted verbatim** (this is the human's actual review point for
   memory content — appends themselves are never gated, so this summary is
   what stands in for one), any memory maintenance performed, and any
   follow-up work or known limitations — plus the drafted commit
   message/PR description from step 5. **Stop and wait** for approval
   before considering the feature/bugfix done, and before acting on the
   commit/PR draft at all.

Once approved, ask whether there's another piece of work. If so, return to
[B1](#b1-feature-specification) with a new slug.

### Talking to the user

At every checkpoint in this loop: ask the question, explain the reasoning
briefly, suggest the option you'd pick — but keep it short. Never let a
check-in balloon into a long writeup, and never treat it as a closed form;
the user can redirect, ask why, or change scope at any point, and that's
expected, not a detour.

---

**Scope discipline:** if the work grows well beyond the original request,
pause and confirm with the user before expanding — treat it as a replanning
question, not something to push through silently.
