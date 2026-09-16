---
title: Agent memory under specs/
kind: feature
status: done
version: 1
updated: 2026-09-16
---

## Problem / Motivation

Agents operate across multiple sessions and need to share durable, cross-session knowledge — observations, learnings, build quirks, and resolved gotchas — without bloating context or losing continuity. Today, knowledge discovered during a `/code` run vanishes at session end; each new session starts with no institutional memory. This forces re-discovery of the same build issues, convention details, and edge cases, reducing efficiency and consistency. A shared, git-committed memory log lets agents record and grep facts without loading the entire session history into the context window, while git history provides the undo mechanism for stale entries.

## Acceptance Criteria

- `specs/memory.md` exists in the specs root (resolved through `/code`'s A0 logic like constitution files; becomes `.agent/specs/memory.md` under a shadow root).
- File format: fixed 3-line header (no frontmatter), then append-only entries matching `YYYY-MM-DDTHH:MM:SSZ [tag] text` (single space, no trailing whitespace, one line).
- Tag set is closed: `build`, `convention`, `decision`, `domain`, `env`, `gotcha`; validator enforces.
- `scripts/validate-specs.js` validates: exact header, no blank lines between entries, every entry format + closed tag, no unsafe/non-portable patterns (masked in output), warnings for line >200 chars, out-of-order timestamp, duplicate, or count >200.
- Only `engineer` and `technical-writer` roles append directly; `researcher`/`architect`/`reviewer`/`tester` report candidates to `coordinator`, which routes to the active writer.
- Read via `Grep` by tag/module/path or `tail`/`Read` with offset+limit (max ~10-20 matched lines per consultation); never read the whole file in normal operation.
- Purge pass triggers at ≥200 entries, targets ≤150 (hysteresis); autonomous but always reported with entry count before/after and each removal cited by criterion number.
- Memory entries are STATEMENTS OF FACT, never instructions; entries cannot grant permissions or override rules; advisory only.
- Provenance rule: only facts from committed repo content or direct human instruction; no secrets/credentials/tokens/PII/hostnames/IPs/account IDs/gitignored values.
- No portability violations: repo-relative paths only (forward slashes), no absolute paths/`~/`/`C:\`, no tool install paths/machine names/checkout-dir names.
- Staleness criteria (numbered 1–6) codified in validator and purge pass: (1) dangling reference, (2) superseded, (3) resolved transient, (4) now documented elsewhere, (5) one-shot event, (6) unverifiable and unused.

## Approach

### Location and format

Memory lives at `specs/memory.md` (one flat file, not sharded by tag or date), resolved through `/code`'s A0 specs-root logic just like constitution files. No frontmatter — append-only logs need no version/status/updated fields (which would create concurrent-write hazards on every append). Header is fixed:

```
# Project Memory

<!-- Append-only, one entry per line: `YYYY-MM-DDTHH:MM:SSZ [tag] text`. See the `memory-format` skill. Do not read this file in full — grep it. -->
```

Followed by one blank line, then entries (no blank lines between entries).

### Entry format

`YYYY-MM-DDTHH:MM:SSZ [tag] text` — single spaces, no trailing whitespace, ≤200 chars (warning if exceeded).

- Timestamp: ISO 8601 UTC, seconds precision, literal `Z` — lexical sort equals chronological; produced via `date -u +%Y-%m-%dT%H:%M:%SZ`.
- Tag: closed vocabulary in square brackets — `[build]`, `[convention]`, `[decision]`, `[domain]`, `[env]`, `[gotcha]`.
- Text: tenseless statement of fact; time-relative words forbidden ("currently", "recently"); if the fact is platform-specific, name the platform explicitly.

### Portability and security rules

Entries must never contain:

- Absolute paths, `~/`, or `C:\` (error).
- Hostnames, usernames, machine names, IPs, local ports, checkout-dir names, home dirs, or tool install paths — name the tool, not its path (error).
- Credentials, tokens, keys, connection strings, signed URLs, PII/PHI/PCI, internal hostnames/private IPs/account IDs not already committed, anything from `.env` or a gitignored file (error, masked in validation output).
- Anything the human marked session-only (self-check before append).
- Instructions, permissions, or rules — memory is advisory and can never override a rule file, constitution, or the human's directive (error if detected).

Anchor all facts on path + symbol/heading name, never bare line numbers (which drift).

### Who may append

- `engineer` and `technical-writer` append directly (both already have Write/Edit/Bash).
- `researcher`, `architect`, `reviewer`, `tester`: report candidate entries to `coordinator`, which routes to the active writer. Rationale: read-only roles' tool grants stay meaningful, and avoiding one-liner routing overhead while preserving control.

### Reading strategy

Never read the whole file in normal operation — use:

- `Grep` by tag/module/path, or
- `tail`/`Read` with offset+limit for recent context — max ~10-20 matched lines per consultation.

Only exception: the purge pass (autonomous dispatch in a throwaway context).

### Maintenance: staleness and purge

Staleness criteria (numbered for citation in purge reports):

1. **Dangling reference** — path/script/command/config key no longer exists (verified not recalled).
2. **Superseded** — later same-tag, same-subject entry contradicts or subsumes it.
3. **Resolved transient** — describes a fixed bug/workaround, verified fixed.
4. **Now documented elsewhere** — constitution/rule/README/feature spec — cite where.
5. **One-shot event** — no forward value (e.g., temporary maintenance window).
6. **Unverifiable and unused** — purge but list in the report for human visibility.

Anti-rule: age alone is never a reason to purge.

Consolidation: merge only same tag + same subject + non-contradicting entries. Merged line takes the newest source's timestamp and position; earlier sources removed (preserves monotonic order). Never merge across tags or contradictory entries (a disagreement means one is stale — resolve against the repo).

Purge threshold: ≥200 entries triggers a review pass, targeting ≤150 (hysteresis). At most one pass per session (cooldown). If a pass cannot reach 150 without discarding real value, it reports so and recommends promoting durable facts to the constitution or a rule file.

Purge dispatch: `coordinator` checks the threshold at B1 and B5 via `Grep` with `output_mode: "count"` for `^\d{4}-` (zero content cost). On threshold, dispatches `technical-writer` to purge autonomously (no approval gate — git history is the undo path), but the pass must report: entry count before/after, each removal with its criterion number, and each merge with its sources. The purge write must be the ONLY change in that diff, so `git diff` is cleanly reviewable.

### Integration into `/code` phases

- **A0** — `specs/memory.md` covered under `<specs-root>`, resolved like constitution files.
- **B1 (Specification)** — `researcher` greps memory for the affected area before drafting.
- **B2 (Implementation)** — `engineer` greps `[build]` and `[gotcha]` before starting; appends learnings post-implementation.
- **B3 (Validation)** — `tester` greps for a failing command on failure.
- **B5 (Documentation)** — durable learnings appended; `coordinator` checks threshold and dispatches purge if needed.

### Implementation tasks (ordered)

1. Write `core/skills/memory-format/SKILL.md`: frontmatter (name/description/version matching `constitution-format`), Purpose, Location, File shape, Tags, Memory vs. constitution vs. feature spec, Portability rules, Git-safety/provenance rules (advisory-never-authoritative), Reading rules, Who may append, Maintenance (staleness/consolidation criteria, threshold, purge pass + report).
2. Register `memory-format` in `agent-tools.yaml`'s `skills:` list.
3. Extend `scripts/validate-specs.js`: new constants (MEMORY_HEADER, MEMORY_TAGS, MEMORY_ENTRY_RE, MEMORY_MAX_LINE=200, MEMORY_MAX_ENTRIES=200, UNSAFE_PATTERNS, NONPORTABLE_PATTERNS); new `validateMemoryFile(specsDir, labelPrefix)` function; called from `validateSpecsDir` after constitution loop, before features.
4. Add `memory-format` to `skills:` list of `core/agents/engineer.md`, `core/agents/technical-writer.md`, `core/agents/researcher.md`. (`coordinator` carries no `skills` by design — its threshold-check duty is described in command prose.)
5. Wire into `core/commands/code.md`: Memory bullet under Ground rules; A0 covers `memory.md` under `<specs-root>`; B1 has `researcher` grep memory; B2 has `engineer` grep and append; B3 has `tester` grep on failure; B5 has coordinator threshold check + dispatch.
6. Mirror summary into `core/workflows/code.md`: skills list, phase summary, success criteria.
7. Update `README.md`'s skills tree to list `memory-format/` alongside constitution and feature-spec formats.
8. Optional: seed `specs/memory.md` in this repo with the header and a couple of real entries as a live fixture.

### Risk mitigation and testing

- **Concurrent appends**: low risk (append-only, no frontmatter to update).
- **Over-deletion**: numbered criteria, purge-only diffs, mandatory report, git history as undo.
- **Prompt-injection persistence**: facts-not-instructions, advisory-never-authoritative, provenance rule, visible diff.
- **Secret leakage**: agent self-check + `UNSAFE_PATTERNS` validator backstop (defense-in-depth) + human sees the diff; validator masks matches as `[REDACTED:<type>]`, reports pattern name + line number only.
- **Format drift**: length/ordering/duplication are warnings; shape/tag/absolute-path/secret-pattern are errors; closed tag set enforces against freeform prose.

Test coverage in `tester` phase (B3):

- `node scripts/validate-specs.js` on this repo's real specs.
- `node scripts/validate-specs.js --dir=<fixture>` over throwaway fixtures covering: valid file, wrong header, blank line between entries, bad tag, malformed timestamp, absolute path, `~/`, `C:\`, a fake `ghp_`-shaped token (assert output contains `[REDACTED:` and NOT the token), over-long line (warn/exit 0), out-of-order timestamp (warn), duplicate entry (warn), 201 entries (warn/exit 0), CRLF line endings (pass).
- Verify `coordinator`'s Grep-count method against a seeded fixture.
- Assert exit codes, not just text.

## Affected Areas

- `specs/memory.md` (create; header + entries).
- `core/skills/memory-format/SKILL.md` (create).
- `agent-tools.yaml` (register skill).
- `scripts/validate-specs.js` (new validation logic + constants).
- `core/agents/engineer.md` (add skill; add B2 action).
- `core/agents/technical-writer.md` (add skill; clarify purge role).
- `core/agents/researcher.md` (add skill; add B1 action).
- `core/commands/code.md` (Memory ground rule; A0 coverage; B1/B2/B3/B5 actions).
- `core/workflows/code.md` (summary update).
- `README.md` (skills tree).

## Out of Scope

- No pinning or protected-entry markers (explicit prior decision — all entries are mutable via purge).
- No sharding by tag, date, or module (kills the single-grep story; flat file is intentional).
- No approval gate before purging (explicit prior decision — autonomously reported purge instead).
- Not a general project-management or ticketing system; memory records facts for agents, not a task/incident/meeting log.
- No conflict resolution beyond "resolve against the repo"; disputes on staleness go to the human via the report.

## Implementation Notes

Implemented per the approved Approach, in order, self-checked as each step
landed:

1. `core/skills/memory-format/SKILL.md` — written per the design, including
   the memory-vs-constitution-vs-feature-spec table and all rules (format,
   portability, git-safety, advisory-never-authoritative, reading, who may
   append, maintenance/purge).
2. Registered `memory-format` in `agent-tools.yaml`'s `skills:` list.
3. Extended `scripts/validate-specs.js`: `MEMORY_HEADER`, `MEMORY_TAGS`,
   `MEMORY_ENTRY_RE`, `MEMORY_MAX_LINE`/`MEMORY_MAX_ENTRIES`,
   `UNSAFE_PATTERNS`, `NONPORTABLE_PATTERNS`, and `validateMemoryFile()`,
   wired into `validateSpecsDir()`. One deviation from the design brief:
   `NONPORTABLE_PATTERNS`'s absolute-path check was narrowed from "any
   leading `/`" to specific machine-specific prefixes
   (`/Users/`,`/home/`,`/root/`,`/var/`,`/tmp/`,`/etc/`,`/opt/`,`/mnt/`,
   `/private/`) — a bare-slash check would have false-positived on
   ordinary URL paths like `/api/users` in a memory entry, which are not a
   portability problem. Self-tested against fixtures: valid file, wrong
   header, a fake `ghp_`-shaped token (confirmed masked, never echoed), and
   an absolute path under `/Users/` (all caught with the expected errors).
4. Added `memory-format` to `skills:` on `engineer.md`, `technical-writer.md`,
   `researcher.md`.
5. Wired into `core/commands/code.md`: a Memory ground rule; A0 notes
   `memory.md` resolves under `<specs-root>`; B1 has `researcher` grep it;
   B2 has `engineer` grep before starting and append learnings after
   self-review; B3 has `tester` grep on failure; B5 has the threshold
   check/dispatch and durable-learning append, folded into the delivery
   summary.
6. Mirrored the same summary into `core/workflows/code.md` (skills list,
   phase summary, roles, success criteria).
7. `README.md`'s skills tree updated (58 → 59 total; added `memory-format/`).
8. Seeded `specs/memory.md` itself with the real header and three genuine
   entries recorded during this implementation (a validator gotcha, the
   writer-role convention, and the `npm test` sequence) — this doubles as
   the first live fixture.

No divergence from the approved Approach beyond the one noted in step 3
above, which tightens a rule rather than changing its intent.

**Post-validation fixes** (from `tester`'s B3 pass, fixed forward per the
loop rather than escalated, since both were small and unambiguous):

1. The secret-masking error message didn't match this spec's own documented
   `[REDACTED:<type>]` wording (it said "(value masked, not shown)" instead).
   Added a `type` field to each `UNSAFE_PATTERNS` entry and changed the
   message to emit `[REDACTED:<TYPE>]`, matching the spec.
2. `scripts/validate-specs.test.js` had zero automated tests for the new
   memory validator — `tester`'s fixture matrix was manual and throwaway.
   Added 14 permanent `node --test` cases covering every case from that
   matrix (valid file, CRLF, wrong header, blank line, bad tag, malformed
   timestamp, absolute path, `~/`, `C:\`, masked secret, over-long line,
   out-of-order timestamp, duplicate, 201-entry threshold) so this logic is
   now exercised on every `npm test`, not just when someone builds fixtures
   by hand.

## Validation

`tester` ran a full regression check against the pre-implementation
baseline (27 script tests / 29 pi-extension tests, 0 failures, clean
`validate`/`build`/`validate-specs`) — no drift, all counts matched.

`tester` then built and ran a 14-case fixture matrix against the new memory
validator (valid file, wrong header, blank line between entries, bad tag,
malformed timestamp, absolute path, `~/`, `C:\`, a fake secret token,
over-long line, out-of-order timestamp, duplicate entry, 201-entry
threshold, CRLF line endings) — all 14 behaved as expected. Confirmed
specifically that a fake `ghp_`-shaped token never appeared in any
validator output, only a `[REDACTED:...]` marker.

`tester` also independently verified `coordinator`'s threshold-check
method (grep-based entry counting) returns the correct count against both
the real 3-entry `specs/memory.md` and a 201-entry fixture — noting it
could only exercise the equivalent shell `grep`, not the `Grep` tool
`coordinator` itself would use (a tool-access limitation of that dispatch,
not a defect in the check itself).

Two findings came back, both fixed forward (not escalated — small,
unambiguous, no scope change): the secret-masking message didn't match this
spec's own `[REDACTED:<type>]` wording, and the new validator logic had no
permanent automated tests. Both are now fixed — see Implementation Notes.
Full suite re-run after the fixes: **41 script tests, 29 pi-extension
tests, 0 failures**, `validate-specs` clean on the real `specs/`.

### Security review (`reviewer`, B3.3 — warranted given the secret-detection logic)

Verdict: **request changes** — no Critical findings, 3 High, 4 Medium, 3
Low. All fixed forward except where noted:

- **H1 (instruction-persistence risk has no realistic mitigation below the
  200-entry threshold)** — fixed: appended memory entries are now quoted
  verbatim in B5's delivery summary (`core/commands/code.md` B5.6), so every
  append is human-visible at the existing gate without adding a new one.
  Not fixed (recorded as a follow-up, not blocking): an instruction-shaped-text
  warning and a reviewer duty to check memory diffs on invocation.
- **H2 (the secret/portability backstop never ran automatically — `npm
  test` skipped `validate:specs`, and CI ran neither it nor `test:scripts`)**
  — fixed: `validate:specs` added to `npm test`; `.github/workflows/build.yml`
  now runs both `validate:specs` and `test:scripts` (the latter was already
  claimed by `README.md`'s CI description but never actually wired in — a
  pre-existing gap this surfaced, not one this feature introduced).
- **H3 (control/bidi/zero-width characters passed validation, defeating
  diff review)** — fixed: `UNSAFE_CHAR_RE` rejects any `\p{Cc}`/`\p{Cf}`
  character in an entry, tested against a real bidi-override string.
- **M1 (a wrong header made the validator skip scanning every entry,
  including for secrets)** — fixed: header mismatches are now recorded but
  scanning continues into the entry region regardless.
- **M2 (secret patterns missed Anthropic-style `sk-ant-` keys)** — fixed for
  that specific, most-relevant-to-this-toolkit case; the rest of the
  suggested pattern-coverage widening (JWTs, more token prefixes, generic
  `token=`/`secret=` assignments) is a follow-up, not blocking.
- **M3 (non-portable-path patterns missed backtick/quote-wrapped paths,
  `/usr/`, and `C:/` forward-slash form)** — fixed: delimiter widened to a
  character class covering quotes/backticks/parens/brackets, `/usr/` and
  similar system dirs added to the prefix list, Windows check now accepts
  either slash direction. The reviewer's suggested two-tier
  (error-on-machine-specific-prefix, warn-on-any-other-absolute-path)
  refinement is a follow-up, not blocking.
- **M4 (post-A0 instructions said "run `validate-specs`" without `--dir`,
  so a shadow-root project would validate the wrong, already-incompatible
  `specs/` forever)** — fixed: a single clarifying sentence in `code.md`'s
  intro makes every later "run `validate-specs`" mean "against
  `<specs-root>`," rather than restating it at all twelve call sites.
- **Lows (IPv4/email false-positive pressure, non-reentrant module-level
  validator state)** — not fixed, recorded as follow-ups; neither blocks
  this feature and both are pre-existing patterns in this validator, not
  introduced by it.

Full suite re-run after the security fixes: **46 script tests, 29
pi-extension tests, 0 failures**; 5 new permanent tests added for the
fixes (backtick-wrapped path, forward-slash Windows path, `sk-ant-` key,
bidi-override character, secrets-still-scanned-after-bad-header).

## Documentation Review

`technical-writer` applied the `doc-review` skill against every doc this
feature could plausibly affect. 6 findings, all applied except one routed
for constitution replanning per the rules below:

1. `README.md`'s CI description (`validate` → `build` → ...) omitted the new
   `validate:specs` step — fixed.
2. `README.md`'s npm-scripts table's `npm test` row omitted `validate:specs`
   — fixed.
3. `README.md`'s `validate:specs` row said "constitution and feature-spec
   formats," missing `memory-format` — fixed.
4. `AGENTS.md`'s `validate:specs` description had the same gap — fixed.
5. `AGENTS.md`'s "`npm test` runs validation, root script tests, and package
   tests" was ambiguous about whether `validate:specs` is included — fixed,
   spelled out explicitly.
6. **Rejected as a false positive** (verified directly before applying, per
   this project's own verify-before-asserting practice): a claimed stale
   skill count ("59 total" allegedly should be "83") was based on a `grep`
   over the *entire* `agent-tools.yaml` file rather than scoping to the
   `skills:` key — the actual count under `skills:` is 59, which is what
   `README.md` already said. No change made.

**Routed for constitution replanning, not silently applied:** `technical-writer`
found that `specs/tech-stack.md`'s Key Conventions section documents the
specs-root/constitution-format convention but doesn't yet mention
`memory.md`/`memory-format` as a peer convention. This is a real gap, but
changing a constitution file requires the human's explicit approval per
this project's own rules — see the proposal presented alongside this
review, not applied here.

## Documentation Updates

Applied directly (routine, non-constitution): `README.md` (CI description,
npm-scripts table, `validate:specs` row), `AGENTS.md` (`validate:specs`
description, `npm test` description) — see Documentation Review for the
exact findings.

**Constitution change (gated, approved separately from this file's own
approval):** `specs/tech-stack.md` bumped to `version: 3` — added
`memory.md`/`memory-format` as a peer specs-root convention in Key
Conventions, and fixed the same CI/npm-scripts staleness there (caught
while making the approved edit, not a separate gate — it was the identical
finding already approved for README/AGENTS.md, just also present in a file
that happens to require its own approval to touch).

No PR is being opened for this dry run; a commit message is drafted below
per the git ground rule, for your review — not applied without your
separate approval.
