---
title: Multi-artifact changelog handling
kind: feature
status: done
version: 1
updated: 2026-09-23
branch: main
---

## Problem / Motivation

`/code`'s current B4/B5 changelog handling (`core/commands/code.md` B4 step 1, B5 step 1) assumes exactly one `CHANGELOG.md` at the project root — correct for a single versioned artifact, but wrong for a repo producing several.

Two confirmed pieces of evidence:

1. **This repo itself** ships 4 npm-published artifacts in lockstep (one version bump touches all): root `@dpurge/agent-tools` plus `packages/claude-agent-tools-plugin`, `packages/opencode-agent-tools-plugin`, `packages/pi-agent-tools-extension` — each its own `package.json`/version. There is only one `CHANGELOG.md`, at the root, mixing all four artifacts' changes. Someone who only installs `@dpurge/opencode-agent-tools-plugin` from npm sees no changelog on that package's own npm page and would have to read Claude/Pi-only entries to find what's relevant to them.
2. A sibling project (`k8s-lab`, not part of this repo) is a monorepo of independently-evolving services (`knowledge/`, `phraseforge/`, `dictionary/`, `shared/`, `workflows/`, no per-service version at all) with one flat root `CHANGELOG.md` where entries are manually prefixed by scope label (e.g. "knowledge: ..."). It has only ever had `## [Unreleased]` — confirming the same structural gap in a less version-aware form.
3. **Live evidence of a second, related gap:** this repo's own `.github/workflows/release.yml` already ran once (`v0.1.1` is tagged) — it bumps every `package.json`/`agent-tools.yaml` version, builds, packs, commits, tags, pushes, and creates a GitHub Release via `gh release create ... --generate-notes` — but never moves any changelog's `[Unreleased]` content into a versioned section first. `CHANGELOG.md` still shows only `## [Unreleased]`, with no `## [0.1.1]` section, and `git log` confirms the release commit never touched it. `--generate-notes`'s auto-generated, commit-derived notes are not a substitute for the project's own curated changelog being current.

This is a design gap in `/code`'s changelog handling itself (used across every project this toolkit is installed into), not just a one-off fix to this repo.

## Acceptance Criteria

- `constitution-format` skill documents an optional `### Artifacts` subsection inside `tech-stack.md`'s `## Infrastructure & tooling` section: a table of {Artifact, Root, Changelog, Versioning}, plus an optional `Built from:` prose line for build fan-out, plus an explicit statement that the subsection is omitted entirely for single-artifact projects (which is the common case and must keep working exactly as today, byte for byte).
- `core/commands/code.md` B4 resolves each feature's *Affected Areas* to the changelog file(s) that need an entry, via longest-prefix matching against declared artifact roots (segment-boundary aware — `packages/pi` must not match `packages/pi-agent-tools-extension`), including fan-out to downstream artifacts per any `Built from:` note, and flags any path matching no declared artifact as its own drift finding (table may be stale). In the single-artifact/no-Artifacts-table case this reduces to exactly today's one-file behavior.
- `core/commands/code.md` B5 writes each entry into the specific artifact changelog(s) B4 named (never re-derives the mapping itself), creating a new changelog file at that artifact's own root (with the standard Keep a Changelog header) if none exists yet.
- `core/skills/doc-review/SKILL.md` gains a "Release wiring" check: when a repo has a CI release workflow (GitHub Actions `.github/workflows/*.yml` is the supported scope; other CI vendors are noted as not inspected, a stated limitation, not silently assumed clean) that creates a git tag, verify that — for every declared artifact whose changelog has a non-empty `## [Unreleased]` — some step *before* the tag step actually rewrites that section into a versioned one (verified by reading the referenced script/tool, not inferred from a step name). Missing, or wrong order (rewrite after the tag), is a High-severity finding with a concrete suggested fix — never auto-edited, per this project's git-safety rules.
- This repo is migrated as the reference implementation: `specs/tech-stack.md` gets a real 4-row Artifacts table + `Built from:` note (constitution update, human-approved, version bumped); `packages/claude-agent-tools-plugin/CHANGELOG.md`, `packages/opencode-agent-tools-plugin/CHANGELOG.md`, `packages/pi-agent-tools-extension/CHANGELOG.md` are created, each carrying the existing "B4/B5 now cover CHANGELOG.md" entry (reworded per artifact) since that change already ships into all four artifacts via `scripts/build.js`'s copy of `core/commands/*` into every package; each package's `files` allowlist (and root `package.json`'s) gains `"CHANGELOG.md"` so it actually reaches the published tarball.
- A new `scripts/release-changelog.js` (mirroring `scripts/set-version.js`'s glob of root + `packages/*`, same version-regex validation, no dependencies) moves each discovered changelog's `## [Unreleased]` body into a new `## [<version>] - <date>` section and re-inserts an empty `## [Unreleased]` above it — idempotent (a changelog with an empty `Unreleased` is left untouched; re-running after a version already exists fails loudly rather than duplicating) — wired into `.github/workflows/release.yml` as a step between the version-bump step and the build/test step, so the release commit and tag include it.
- A packaging regression check (new or extended `scripts/*.test.js`) asserts every `packages/*/package.json`'s `files` array includes `CHANGELOG.md` and the file exists on disk.
- `scripts/release-changelog.test.js` covers: normal move, multiple files in one run, empty-Unreleased left untouched, missing file skipped, existing target version heading fails loudly, invalid version rejected, re-run after success is a no-op.
- `AGENTS.md`'s "hand-edited files in packages" list is updated to include `CHANGELOG.md` alongside `package.json`/`index.js`/`*.test.js`.
- Full suite green: `npm run validate`, `npm run validate:specs`, `npm run build`, `npm run test:scripts`, `npm run test:packages`, `npm test`.

## Approach

### Decision 1 — Artifacts declared as an optional `### Artifacts` subsection in `tech-stack.md`

Not a new top-level `##` section (the constitution's `##` section list is exact and order-enforced by `scripts/validate-specs.js`'s `checkSections`/`CONSTITUTION_SECTIONS` — adding one breaks every existing `tech-stack.md`, including this repo's own). A `###` subsection is invisible to the current validator's section-heading regex, so it's purely additive with zero validator change required to land. Table columns: **Artifact** (published/deployed name), **Root** (repo-relative directory, `.` for the repo root artifact), **Changelog** (repo-relative path, normally `<Root>/CHANGELOG.md`), **Versioning** (`lockstep`/`independent`/`none`, with an optional parenthetical naming the version-holding file(s); `none` covers the k8s-lab shape — an artifact with no version field, whose changelog may legitimately stay `## [Unreleased]` forever). An optional free-prose `Built from:` line records build fan-out (e.g. "the three `packages/*` artifacts are assembled from `core/` by `scripts/build.js`; a change under `core/` reaches all four artifacts").

**Implicit default, stated explicitly in the skill:** when the subsection is absent, the project has exactly one artifact (root `.`, `CHANGELOG.md`, versioning unspecified) — every downstream phase operates on "the artifact list," which is a one-element list reproducing today's behavior exactly. This is what keeps the common single-artifact case free of new ceremony.

Alternatives rejected: a required `## Artifacts` section (breaks every existing file, forces ceremony on the common case); a new `specs/artifacts.md` constitution file (a fourth file with its own frontmatter/validation/A1/A3/A5 wiring, for a table); a machine-readable manifest like `specs/artifacts.yaml` or an `agent-tools.yaml` key (new format, and `agent-tools.yaml` is this repo's own manifest, not portable to host projects using this toolkit).

### Decision 2 — B4 owns the mapping; B5 only consumes it

B4 resolves *Affected Areas* to concrete changelog file paths and names them in its finding; B5 writes to exactly those paths without re-deriving anything. This concentrates the one genuinely non-trivial piece of reasoning in a single phase, lets the human see the resolved file list at the B4→B5 review point before any write happens, and fits the model-tiering rule (`core/commands/code.md`'s Ground rules) — a small `technical-writer` following an explicit path list is far more reliable than one re-running prefix matching itself.

**Mapping rule** (goes into `core/commands/code.md` B4 step 1, with a worked example; the generic statement goes into `doc-review`):

1. Build the artifact list from `tech-stack.md`'s Artifacts table, or the implicit single-root artifact if the subsection is absent.
2. Normalize each Affected Areas entry to a repo-relative POSIX path.
3. Match each path to the artifact whose Root is its longest prefix, **on path-segment boundaries only** (`packages/pi` must never match `packages/pi-agent-tools-extension`). Root `.` is a prefix of everything and is the fallback that wins only when no deeper root matches.
4. **Fan-out:** if the Artifacts table's `Built from:` note says a path's artifact feeds downstream artifacts, include those too. Worked example to keep verbatim in the skill: a change under `core/skills/` produces Affected Areas containing only `core/...` paths, but `scripts/build.js` ships it into all three packages, so all four changelogs need an entry.
5. Apply the existing user-facing-vs-internal filter (refactor/test-only/docs-only = no entry) **per candidate artifact**, not once globally.
6. A path matching no declared artifact is its own B4 finding ("`<path>` matches no declared artifact; the Artifacts table may be stale") rather than being silently dropped — this doubles as the table's own staleness detector.
7. B4's output: a list of `{changelog path, Keep a Changelog category, proposed one-line entry}` per affected artifact, recorded in *Documentation Review*.

### Decision 3 — B5 writes per artifact

For each `{changelog path, category, entry}` B4 produced, write into that artifact's own `## [Unreleased]`, in the matching category — entry text may be reworded per artifact for that artifact's own consumer, not copy-pasted identically. Create the file at that artifact's own root (never the repo root) with the standard Keep a Changelog header + empty `## [Unreleased]` if it doesn't exist yet. When the target package has a `files` allowlist, B5 must also ensure `"CHANGELOG.md"` is listed there — otherwise the file never reaches the published tarball and the whole point (npm consumers seeing their own changelog) silently fails.

### Decision 4 — `doc-review`'s "Release wiring" check

New check group, scoped deliberately to GitHub Actions (`.github/workflows/*.{yml,yaml}`) — other CI vendors are noted as "not inspected" in the finding, not assumed clean; a full multi-vendor parser is a lot of complexity for little payoff for this toolkit's actual user base. Detect tag-creation via `git tag`, `git push --tags`, `gh release create`, or known tagging actions. Detect changelog-rewrite via a known tool (`changesets`, `release-please`, `standard-version`, `changelogen`, `git-cliff`, `auto-changelog`) or a repo script — verified by reading the script, not inferring from its name. Not-a-finding cases: no curated `CHANGELOG.md` with `## [Unreleased]` exists at all; or the artifact's `Versioning` is `none` and nothing tags it. A finding requires: the workflow tags, at least one declared artifact has a non-empty `## [Unreleased]`, and no step before the tag step rewrites it — severity High (a published release's changelog silently omits that release; `gh release create --generate-notes`'s auto-notes are not a substitute for the curated file). Wrong ordering (rewrite step exists but runs after the tag step) is reported as the specific defect, still High. Iterates the full declared artifact list — a lockstep release that versions only the root changelog is a separate finding for each package changelog it skipped. Findings must quote step names/paths, never secret expressions (mask per the security rule) — never auto-edited; a fix is drafted and goes through the normal approval-gated path since a workflow file is code.

### Decision 5 — CI discovers changelogs by globbing, mirroring `set-version.js`

`scripts/release-changelog.js` globs root + `packages/*` for `CHANGELOG.md` — same discovery mechanism as `scripts/set-version.js`, not a parser of `tech-stack.md`'s prose table (that would couple the release pipeline's critical path to a markdown doc). This means the two views (declared artifacts vs. what CI actually touches) can drift — Decision 4's doc-review check is precisely the drift detector for that. Contract: `node scripts/release-changelog.js <version>`, same version-regex validation as `set-version.js`; for each discovered changelog, move `## [Unreleased]`'s body into a new `## [<version>] - <date>` heading and re-insert an empty `## [Unreleased]` above it; idempotent — a changelog with an empty `Unreleased` body is left untouched (covers k8s-lab-style and fresh-package cases), and an already-existing target version heading fails loudly rather than duplicating; no dependencies, ESM, `node:fs/promises`, matching `set-version.js`'s style. Wired into `.github/workflows/release.yml` between the "Compute and apply new version" step and the "Validate, build & test" step, so the later `git add -A` + commit + tag include it.

### Reference-implementation decision (human-approved during this spec's review)

The existing single `CHANGELOG.md` "Unreleased" entry (about `/code`'s B4/B5 CHANGELOG handling) is copied — reworded per artifact — into all 3 new package changelogs, not left empty, because that change already ships into every artifact via `scripts/build.js`'s copy of `core/commands/*` into each package's build output. This also exercises the new per-artifact write path as part of this feature's own delivery.

### Ordered implementation plan

1. Document the `### Artifacts` subsection in `constitution-format/SKILL.md` (table shape, column semantics, implicit single-artifact default stated explicitly, `Built from:` fan-out note, two worked examples: lockstep npm packages and no-version monorepo apps).
2. Update `specs/tech-stack.md` with this repo's real 4-row Artifacts table + `Built from:` note — a constitution change, gated by the human, `version` bumped, via the `Updating an approved file` path.
3. Create the 3 package `CHANGELOG.md` files (header + `## [Unreleased]` with the reworded backfilled entry per the decision above); add `"CHANGELOG.md"` to each package's `files` array and to root `package.json`. Verify `npm run build` leaves them alone and `npm pack --dry-run` includes them in each package dir.
4. Add `scripts/release-changelog.js` + `scripts/release-changelog.test.js`.
5. Wire the new script into `.github/workflows/release.yml` between the version-bump and build/test steps.
6. Add the mapping rule + per-artifact write rules to `core/commands/code.md` B4/B5 (with the worked longest-prefix and `core/`-fan-out examples); update `core/workflows/code.md`'s phase summaries.
7. Add the "Release wiring" check group to `core/skills/doc-review/SKILL.md`.
8. Add the packaging regression assertion (`files` includes `CHANGELOG.md` and the file exists) to `scripts/*.test.js`.
9. Update `AGENTS.md` (hand-edited-files-in-packages list) and `README.md` if it documents package contents.
10. Dogfood B5 for this feature itself: add this feature's own entry to all four changelogs.
11. Optional follow-up, not required for this feature's acceptance: teach `scripts/validate-specs.js` to structurally validate the Artifacts subsection when present (roots exist/are directories, changelog paths live inside their root, no duplicate/overlapping roots, `Versioning` from the allowed vocabulary) — flag as a possible `## Next` roadmap item rather than committing to exact schema now.

Explicitly not touched: `core/commands/release.md`'s `/release` command already covers changelog/version bump as a human-driven step; the release-wiring check stays in `doc-review`, not bolted onto `/release`, per the approved design decision.

### Risks

- Artifacts table drifting from reality — mitigated by B4's unmatched-path finding (mapping rule step 6) and the optional validator (step 11).
- A small `technical-writer` model writing to the wrong (root) file — mitigated by B4 naming exact paths that B5 just follows (Decision 2), rather than B5 re-deriving the mapping.
- Longest-prefix mismatches (`packages/pi` vs `packages/pi-agent-tools-extension`) — mitigated by the explicit segment-boundary rule and this exact pair as the stated counter-example in the skill text.
- Fan-out noise (one `core/` change needing 4 changelog edits) — inherent and accepted; bounded by the existing user-facing-vs-internal filter applied per artifact.
- Release script run twice, or against an empty `Unreleased` — mitigated by the stated idempotence contract (skip empty, fail loudly on existing target heading).
- `files` allowlist omission silently defeating the whole point — mitigated by the new packaging regression test plus CI's existing `npm pack --dry-run` check.
- Script-injection risk in the new `release.yml` step: take the version from the existing `steps.version.outputs.version` output via an `env:` variable rather than direct `${{ }}` interpolation into `run:`, matching how the workflow already handles this at its version step.

## Affected Areas

- `core/skills/constitution-format/SKILL.md` (new `### Artifacts` subsection docs)
- `specs/tech-stack.md` (new Artifacts table — constitution change, separately gated)
- `packages/claude-agent-tools-plugin/CHANGELOG.md`, `packages/opencode-agent-tools-plugin/CHANGELOG.md`, `packages/pi-agent-tools-extension/CHANGELOG.md` (new)
- `packages/*/package.json`, root `package.json` (`files` array)
- `scripts/release-changelog.js`, `scripts/release-changelog.test.js` (new)
- `.github/workflows/release.yml` (new step)
- `core/commands/code.md` (B4/B5 mapping + write rules)
- `core/workflows/code.md` (phase summary)
- `core/skills/doc-review/SKILL.md` (Release wiring check)
- `scripts/*.test.js` (packaging regression assertion)
- `AGENTS.md`, `README.md` (docs)
- `CHANGELOG.md` at root (dogfooded entry for this feature itself)

## Out of Scope

- No new heavy tooling (changesets-style pending-changeset files) — explicitly rejected in favor of per-artifact Keep a Changelog files, per the approved design decision.
- No multi-CI-vendor parsing in the `doc-review` release-wiring check (GitLab CI, Jenkins, etc.) — GitHub Actions only for now, stated as a limitation, not silently assumed clean elsewhere.
- No machine-readable artifacts manifest (`specs/artifacts.yaml`, or a new `agent-tools.yaml` key) — the Artifacts table lives in prose in `tech-stack.md`, read by agents, not parsed by CI (Decision 5's explicit trade-off).
- No changes to the `/release` command/skill — the release-wiring check lives entirely in `doc-review`.
- No retroactive backfill of the already-tagged `v0.1.1` release's changelog history beyond what's explicitly decided above (the single existing Unreleased entry) — no fabricated history for anything before it.
- Structural validation of the Artifacts subsection in `scripts/validate-specs.js` is an optional follow-up (implementation plan step 11), not a hard requirement of this feature.

## Implementation Notes

Implemented per the approved Approach, in order, self-checked as each step
landed:

1. `core/skills/constitution-format/SKILL.md` — added the `### Artifacts`
   subsection docs inside the `## File: specs/tech-stack.md` section: the
   table shape (Artifact/Root/Changelog/Versioning columns), the
   `Built from:` fan-out note, the implicit single-artifact default stated
   explicitly, and two worked examples (lockstep npm packages; no-version
   monorepo apps).

2. `specs/tech-stack.md` — added the real 4-row Artifacts table (root
   `@dpurge/agent-tools` + 3 `packages/*`, all `lockstep` versioning) plus
   a `Built from:` note describing `scripts/build.js`'s fan-out of `core/`
   changes into all four artifacts. This was a constitution-file change,
   reviewed and approved by the human separately from the feature spec's own
   approval, bumping `tech-stack.md` to `version: 4`.

3. Created `packages/claude-agent-tools-plugin/CHANGELOG.md`,
   `packages/opencode-agent-tools-plugin/CHANGELOG.md`,
   `packages/pi-agent-tools-extension/CHANGELOG.md`, each with the standard
   Keep a Changelog header and the existing root "B4/B5 now cover
   CHANGELOG.md" entry reworded per package (per the human-approved backfill
   decision, since that change already ships to every artifact via
   `scripts/build.js`'s copy of `core/commands/*`). Added `"CHANGELOG.md"`
   to the `files` array of all three package `package.json`s and the root
   `package.json`. Verified via `npm run build` (files untouched by
   `clean()`) and `npm pack --dry-run` in all four locations (CHANGELOG.md
   confirmed present in every tarball listing).

4. Added `scripts/release-changelog.js` — dependency-free ESM script
   mirroring `scripts/set-version.js`'s style and glob-discovery pattern
   (root + `packages/*`), moving each discovered changelog's
   `## [Unreleased]` body into a new `## [<version>] - <date>` section and
   re-inserting an empty `## [Unreleased]` above it. Idempotent by design:
   an empty `Unreleased` body is left untouched; an already-existing target
   version heading throws and aborts before any file is written (validates/plans
   all files before writing any, so a failure never leaves a partial run).
   Added `scripts/release-changelog.test.js` with 8 cases (normal move,
   multi-file, empty-Unreleased-untouched, missing-file-skipped,
   duplicate-version-fails-loudly, invalid-version-rejected,
   rerun-fails-loudly-not-silently, no-Unreleased-heading-fails-loudly —
   the last one added as a B3 fix-forward, see below).

5. Wired `scripts/release-changelog.js` into `.github/workflows/release.yml`
   as a new "Update changelogs" step between "Compute and apply new version"
   and "Validate, build & test", passing the version via
   `env: VERSION: ${{ steps.version.outputs.version }}` rather than direct
   `${{ }}` interpolation into the shell (per the spec's stated security
   decision), with `set -e` matching sibling steps' style.

6. `core/commands/code.md` B4 — added the multi-artifact mapping rule
   (artifact list from `tech-stack.md`'s `### Artifacts` table or the
   single implicit artifact; longest-prefix matching on path-segment
   boundaries, with the `packages/pi` vs `packages/pi-agent-tools-extension`
   counter-example; `Built from:` fan-out inclusion; the user-facing filter
   applied per artifact; unmatched-path findings). B5 — changed to write
   each `{changelog path, category, entry}` B4 resolved into that exact
   file, creating it at that artifact's own root if missing, never
   re-deriving the mapping. Mirrored as brief summary bullets into
   `core/workflows/code.md`'s phase list.

7. `core/skills/doc-review/SKILL.md` — added a "Release wiring" check group
   (after Correctness, before Consistency): GitHub-Actions-only scope
   (stated limitation for other CI vendors); tag-creation and
   changelog-rewrite-coverage detection; multi-artifact per-declared-artifact
   checking; not-a-finding cases (no curated changelog, or `Versioning:
   none`); High-severity finding criteria; ordering counts as its own defect;
   never auto-edit, report a fix instead; secret-masking in quoted evidence.

8. Added `scripts/packaging.test.js` — 2 tests asserting every
   `packages/*/package.json` (and root `package.json`) lists `CHANGELOG.md`
   in `files` and that the file exists on disk, catching the exact failure
   mode where the feature's premise (npm consumers seeing their own
   changelog) would silently break.

9. Updated `AGENTS.md` and `README.md` (two spots: the Quick-orientation
   bullet and the repo-tree paragraph) to list `CHANGELOG.md` alongside
   `package.json`/`index.js`/`*.test.js` as a normal hand-edited file
   inside `packages/*`.

**B3 fix-forward** (not escalated — small, unambiguous, no scope change):
`tester`'s B3 validation pass flagged a coverage gap — no test exercised
the case of a changelog with no `## [Unreleased]` heading at all, even
though `release-changelog.js`'s `planUpdate()` already threw a clear error
for it. Added the 8th test case to `scripts/release-changelog.test.js`
confirming the existing error path and that the file is left untouched. No
production code changed.

**Memory appended** (already done, note it here per this project's
convention): two `specs/memory.md` entries — a `[convention]` note that a
`###` subsection is invisible to `validate-specs.js`'s `checkSections` regex
(which is how the Artifacts table was added without a new top-level `##`
section), and a `[gotcha]` note that this repo has no Prettier
config/enforcement, so `prettier --check` failures on existing files aren't
a regression signal.

No divergence from the approved Approach beyond the one B3 fix-forward noted
above (test coverage addition, not a behavior change).

## Validation

Summarized from the tester's actual reported results (all real, from this
session):

- **Pre-implementation baseline** (recorded before any implementation step):
  `npm run validate` PASS; `npm run validate:specs` PASS (5 files); `npm run
  build` PASS; `npm run test:scripts` — 55/55 pass; `npm run test:packages`
  — claude/opencode plugins pass `node --check index.js`, pi-extension 29/29
  pass; `npm test` PASS, same counts.

- **Post-implementation full regression pass**: `npm run validate` PASS;
  `node scripts/validate-specs.js` PASS (6 files, now including this
  feature's own spec); `npm run build` PASS; `npm run test:scripts` — 64/64
  pass at that point (55 baseline + 7 release-changelog tests + 2 packaging
  tests); `npm run test:packages` — unchanged, 29/29 pi-extension tests pass;
  `npm test` PASS, same counts. No regressions against baseline.

- **Additionally verified**: `npm pack --dry-run` at root and in all three
  `packages/*` directories — `CHANGELOG.md` confirmed present in every
  tarball's file listing, both right after step 3 and again after all later
  steps landed. `.github/workflows/release.yml` re-parsed as YAML after all
  edits — well-formed, step order confirmed: "Compute and apply new version"
  → "Update changelogs" → "Validate, build & test" → ... → "Commit and tag"
  → "Create GitHub Release".

- **One coverage gap found and fixed forward** (see Implementation Notes) —
  after the fix, `npm run test:scripts` — **65/65 pass**, 0 failures. This
  is the final, current test count.

- **No security review was separately dispatched** — this feature is not
  security-sensitive in the sense that warrants the `reviewer` agent (no
  auth, no sensitive-data handling, no new external dependencies); the one
  CI-workflow change was self-reviewed by `engineer` against
  `security-review` principles inline (env-var version passing instead of
  raw `${{ }}` interpolation into shell, no new permissions/secrets touched
  — `permissions: contents: write` was already granted).

## Documentation Review

`technical-writer` applied the `doc-review` skill (now including this feature's own new "Release wiring" check group) against every doc this feature could plausibly affect: `README.md`, `AGENTS.md`, root and all 3 `packages/*/CHANGELOG.md`, `core/skills/constitution-format/SKILL.md`, `core/skills/doc-review/SKILL.md`, `core/commands/code.md`, `core/workflows/code.md`, `specs/tech-stack.md`, `specs/mission.md`, `specs/roadmap.md`.

**Dogfooded verification — Release wiring check applied to this repo's own `.github/workflows/release.yml`:** confirmed it now passes the very check this feature added. The "Update changelogs" step (running `scripts/release-changelog.js`) is present and correctly ordered before the "Commit and tag" step's `git tag` command. Verified by reading the workflow file directly, not assumed.

**Dogfooded verification — CHANGELOG drift for this feature's own changes**, using the new multi-artifact mapping rule this feature added to `core/commands/code.md` B4: this feature's Affected Areas (`core/skills/`, `core/commands/`, `core/workflows/`, `scripts/`, `.github/workflows/`, `specs/tech-stack.md`, `AGENTS.md`, `README.md`) all map to the root artifact, with `Built from:` fan-out sending the `core/`-rooted changes to all three `packages/*` artifacts too. Finding: all four changelogs (root `CHANGELOG.md` and all three `packages/*/CHANGELOG.md`) need a new `### Added` entry for this feature's own capability — the backfilled entry each already carries (about the prior "B4/B5 now check CHANGELOG.md" feature) is a different, earlier change, not this one. This is the expected B4 outcome; B5 (next) adds these four entries.

**General correctness and consistency** — no drift found. Specifically confirmed accurate: `README.md`'s and `AGENTS.md`'s "hand-edited files in packages" lists both correctly include `CHANGELOG.md`; `core/commands/code.md`'s B4/B5 prose matches what was actually implemented (multi-artifact mapping, longest-prefix/segment-boundary matching, `Built from:` fan-out, per-artifact filter, unmatched-path findings, B5 writing to B4's resolved paths without re-deriving); `core/skills/doc-review/SKILL.md`'s new Release wiring group matches its actual behavior when applied above; `core/skills/constitution-format/SKILL.md`'s Artifacts subsection docs match the real table in `tech-stack.md`; `core/workflows/code.md`'s brief summary stays consistent with the fuller `code.md` prose.

**Constitution files** — `specs/mission.md` needed no change (mission is unaffected — this is a mechanism improvement, not a change to what the toolkit does or who it's for). `specs/roadmap.md` needed no change at this phase — the feature's `## Now` line correctly remains until B5 removes it per the mechanical Now→documented lifecycle; not a drift finding, just noted as expected and correct.

No High, Medium, or Low findings requiring a fix. The single actionable item — four pending changelog entries — is B5's normal job, not a documentation drift defect.

## Documentation Updates

**Changelog entries added:**

1. `CHANGELOG.md` (root) — added entry under `## [Unreleased] / ### Added`:
   "Multi-artifact changelog handling: when a project declares multiple
   artifacts (e.g. npm packages or services) in `specs/tech-stack.md`'s
   `### Artifacts` table, `/code` B4 maps each affected area to its artifact's
   changelog(s) via longest-prefix matching with fan-out support, and B5 writes
   entries per artifact rather than all to one root file. A new
   `scripts/release-changelog.js` moves `## [Unreleased]` into versioned sections
   during release, integrated into the release workflow to tag with current
   changelog(s). `doc-review`'s new "Release wiring" check flags release
   workflows that tag without first versioning their changelog."

2. `packages/claude-agent-tools-plugin/CHANGELOG.md` — added entry under
   `## [Unreleased] / ### Added`: "Multi-artifact changelog support: the `/code`
   command bundled in this plugin now correctly handles projects with multiple
   artifacts (packages, services, etc.), routing each feature's changelog entry
   to the right artifact file(s) via longest-prefix matching and build fan-out.
   The release workflow checker (`doc-review`'s Release wiring test) now flags
   release workflows that create tags without first versioning their changelog(s)."

3. `packages/opencode-agent-tools-plugin/CHANGELOG.md` — added entry under
   `## [Unreleased] / ### Added`: "Multi-artifact changelog support: the `/code`
   command bundled in this plugin now correctly handles projects with multiple
   artifacts (packages, services, etc.), routing each feature's changelog entry
   to the right artifact file(s) via longest-prefix matching and build fan-out.
   The release workflow checker (`doc-review`'s Release wiring test) now flags
   release workflows that create tags without first versioning their changelog(s)."

4. `packages/pi-agent-tools-extension/CHANGELOG.md` — added entry under
   `## [Unreleased] / ### Added`: "Multi-artifact changelog support: the `/code`
   command bundled in this extension now correctly handles projects with multiple
   artifacts (packages, services, etc.), routing each feature's changelog entry
   to the right artifact file(s) via longest-prefix matching and build fan-out.
   The release workflow checker (`doc-review`'s Release wiring test) now flags
   release workflows that create tags without first versioning their changelog(s)."

**Roadmap update:**

Removed the `## Now` line for this feature from `specs/roadmap.md`:
"- Multi-artifact changelog handling — branch `main` — specs/features/multi-artifact-changelogs.md"
(per the constitution-format skill's "## Now line lifecycle" mechanical removal rule, as the work is
now documented in changelogs, not in progress).
