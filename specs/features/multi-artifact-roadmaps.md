---
title: Multi-artifact roadmap handling
kind: feature
status: done
version: 1
updated: 2026-09-23
branch: main
---

## Problem / Motivation

`/code`'s `## Now`/`## Next`/`## Later` roadmap lives in exactly one `roadmap.md` at the specs root, just as `CHANGELOG.md` used to live in exactly one file before the `multi-artifact-changelogs` feature (see `specs/features/multi-artifact-changelogs.md`) taught `/code` to route changelog entries to per-artifact `CHANGELOG.md` files via the `### Artifacts` table in `tech-stack.md`.

The same gap exists for roadmaps, but the right answer isn't symmetric across projects. The human clarified this directly in conversation:

- **This repo** (`agent-tools`) ships 4 artifacts, but they're one mental feature-track: every change is authored once under `core/` and fans out to all 4 packages via `scripts/build.js`. One shared `roadmap.md` is correct here and needs no change.
- **A sibling project** (`k8s-lab`, not part of this repo) is the opposite: 3 independently-versioned, independently-released applications (`dictionary`, `phraseforge`, `knowledge` — each its own Dockerfile, own path-triggered CalVer GitHub Actions release workflow per its `tech-stack.md`), plus a k3s/Taskfile/Kubernetes-manifests environment layer that isn't an application at all. The human wants a separate roadmap *and* a separate changelog per artifact there, plus the environment layer to be its own first-class concern — not an unstated fallback.
- Confirmed by inspection: `k8s-lab`'s current `specs/roadmap.md` is at `version: 22` and its `CHANGELOG.md` already manually prefixes entries by app name (`knowledge: ...`) — i.e. the project has been informally simulating per-artifact separation inside one shared file for a while.

`/code` needs a single mechanism that collapses to "one shared roadmap" for projects like this repo and expands to "fully separate roadmaps" for projects like `k8s-lab`, with zero ambiguity about which roadmap (and which changelog) any given feature belongs to.

## Acceptance Criteria

- `constitution-format` skill's `### Artifacts` table (added by `multi-artifact-changelogs`) gains one more optional column, `Roadmap` — a repo-relative path to that artifact's own roadmap file. An empty cell, or the column being absent from the table entirely, means that artifact's roadmap is the specs-root `roadmap.md` (the same implicit-default pattern already used for the single-artifact case). Multiple rows may share the same `Roadmap` value, collapsing them into one shared file (this repo's case); each row may instead have its own distinct value (k8s-lab's case). Documented with both worked examples.
- `core/commands/code.md`'s B2 (adding a feature's `## Now` line) and B5 (removing it) resolve which roadmap file(s) to write via the exact same longest-prefix + `Built from:` fan-out mapping B4 already uses for changelogs (applied to the `Roadmap` column instead of `Changelog`) — cross-referenced from B4's existing mapping-rule prose rather than restated, to avoid the two descriptions drifting apart. A feature whose Affected Areas resolve to more than one distinct roadmap file gets its `## Now` line added to (and later removed from) each one.
- B1's slug-reuse rule ("if this feature already has a `Next`/`Later` line in `roadmap.md`, reuse that slug") is generalized to search every declared roadmap file, not just the specs-root one, before minting a new slug.
- `scripts/validate-specs.js` discovers every distinct `Roadmap` path declared in `tech-stack.md`'s `### Artifacts` table (deduplicated — a value equal to the specs-root `roadmap.md`'s own path is not double-validated) and validates each with the exact same schema already applied to the specs-root `roadmap.md` (frontmatter `version`/`status`/`updated` + exactly `Now`/`Next`/`Later`/`Out of scope` `##` sections, in order). A declared path that doesn't exist on disk, or exists but fails that schema, is a validation error naming the specific path — never silently skipped.
- If the `### Artifacts` table itself can't be parsed (malformed markdown table under the `### Artifacts` heading), that's a validation error too, not a silent no-op — this is genuinely new parsing surface for a script that previously only ever dealt with fixed filenames, so it fails loudly rather than pretending nothing is declared.
- Projects with no `### Artifacts` table, or a table with no `Roadmap` column, see zero behavior change — this repo's own `tech-stack.md` needs no edit for this feature to land (the whole point of "one roadmap works well here" is that it costs nothing to keep).
- `scripts/validate-specs.test.js` covers: a table declaring 2+ distinct `Roadmap` paths, both valid, both discovered and validated; a declared path missing on disk (error); a declared path existing but with wrong `##` sections (error naming that path); duplicate `Roadmap` values across rows validated exactly once, not twice; a table with no `Roadmap` column at all (no behavior change, confirms this repo's own real table still passes untouched); a malformed `### Artifacts` table (error, not silently ignored).
- `core/workflows/code.md`'s B2/B5 phase summaries briefly mirror the roadmap-routing addition.
- Full suite green: `npm run validate`, `npm run validate:specs`, `npm run build`, `npm run test:scripts`, `npm run test:packages`, `npm test`.
- Explicitly **not** part of this feature's Affected Areas: adjusting `k8s-lab`'s own specs to actually use this. That's a separate, already-agreed follow-up the human will direct once this feature is approved and done — a different project, not part of this repo's own spec/implementation loop.

## Approach

### Decision 1 — one more optional column on the existing `### Artifacts` table, not a new mechanism

The `multi-artifact-changelogs` feature already built the exact machinery this needs: a per-artifact table in `tech-stack.md`, longest-prefix matching of *Affected Areas* against each row's `Root` (segment-boundary aware), and a `Built from:` fan-out note for build-time or source-level fan-out (e.g. `shared/` consumed by multiple apps). Adding `Roadmap` as a fifth column and reusing that identical matching logic — just pointed at a different column — is the whole design. No new table, no new file, no new fan-out concept.

Column semantics: `Roadmap` — repo-relative path to that artifact's roadmap file, normally `<Root>/roadmap.md` for a genuinely separate artifact, or simply omitted/left empty when that artifact shares the specs-root roadmap. Unlike `Changelog` (which every row in this repo's own table currently specifies explicitly, by deliberate choice, even though all four share one version), `Roadmap` is expected to be *omitted entirely* far more often — most projects, including this one, want one roadmap regardless of how many changelogs they have. This asymmetry is intentional: the two columns answer genuinely different questions (what ships to whom vs. what one team is planning), so one collapsing and the other not is not a contradiction, it's two independent choices the table lets a project make separately per column.

Alternatives considered: a parallel `### Roadmaps` table mirroring `### Artifacts` — rejected, it would force every project onto two tables to keep in sync instead of one, for information that's naturally a property of the same artifact row. Inferring roadmap separation from `Versioning` (e.g. `independent` implies separate roadmap) — rejected, conflates two different axes; a project could want independent versioning with one shared roadmap or vice versa, and inferring one from the other removes the user's actual choice.

### Decision 2 — B2/B5 cross-reference B4's mapping rule instead of restating it

B4's existing prose (added by `multi-artifact-changelogs`) is the fullest description of the longest-prefix + fan-out algorithm. Rather than copy it into B2 and B5 too (three descriptions that could drift out of sync over time), B2 and B5 get a short instruction: resolve target roadmap file(s) "the same way B4 resolves changelog files (see B4 step 1), applied to the `Roadmap` column instead of `Changelog`." This mirrors how this document itself already cross-references the `constitution-format` and `feature-spec-format` skills rather than restating their rules inline.

Concretely: B2 (feature implementation start) already knows the approved spec's *Affected Areas* by the time it adds the `## Now` line (B1 writes *Affected Areas* before approval) — so the mapping can run at that point exactly as B4 will later run it for changelogs. B5 removes the `## Now` line from every file B2 added it to (tracked implicitly by re-running the identical mapping against the same *Affected Areas* — no new state needs to be stored anywhere for this).

B1's slug-reuse rule is generalized from "check `roadmap.md`'s `Next`/`Later`" to "check every declared roadmap file's `Next`/`Later`" — in practice, `researcher`/`coordinator` narrows this quickly since the user's request usually already names which artifact it concerns.

### Decision 3 — `validate-specs.js` must actually parse the `### Artifacts` table (no glob shortcut exists)

The `multi-artifact-changelogs` feature deliberately kept its *release* script (`scripts/release-changelog.js`) glob-based (root + `packages/*`) rather than parsing `tech-stack.md`, specifically to avoid coupling a CI-critical-path script to a prose document — and accepted that the two views could drift, with `doc-review`'s "Release wiring" check as the drift detector. That reasoning doesn't transfer here: `packages/*` is an agent-tools-specific npm-workspaces convention, not a general one — `k8s-lab`'s artifacts live at `dictionary/`, `phraseforge/`, `knowledge/`, with no shared parent directory to glob, and no project-independent directory convention exists for "where are this project's artifacts." There is no glob to fall back on. `validate-specs.js` — a deterministic script, unlike `/code`'s own agent-driven B2/B4/B5 logic which already reads `tech-stack.md`'s prose directly — has no choice but to parse the `### Artifacts` markdown table itself to discover declared `Roadmap` paths.

Scope of the parser: find the `### Artifacts` heading inside `tech-stack.md`'s body, read the markdown table immediately under it, split header/rows on `|`, map header names to column indices (so column order doesn't matter, only names), extract the `Roadmap` column's cell per row (trimmed, backtick-stripped), skip empty cells (implicit default, not an override), and de-duplicate the remaining values against each other and against the specs-root `roadmap.md`'s own repo-relative path (`roadmap.md`, always). If no `### Artifacts` heading exists at all, or no `Roadmap` column header exists in the table found, there is nothing to discover — this repo's own table (no `Roadmap` column) hits exactly this path and sees zero new validation. If a `### Artifacts` heading exists but the table under it can't be parsed as a table at all (no `|`-delimited rows, or a header/row cell-count mismatch), that is a validation error, not a silent skip — this is new, deliberately strict behavior for genuinely new parsing surface, not a relaxation of anything that worked before.

Validating each discovered path reuses the identical schema already applied to the specs-root `roadmap.md` (frontmatter `version`/`status`/`updated`, then exactly `Now`/`Next`/`Later`/`Out of scope` `##` sections in order) — factored so both the specs-root file and every discovered extra file share one code path, not two copies of the same checks. Repo-relative `Roadmap` paths are resolved against the project root, which is threaded through as an explicit parameter rather than re-derived from `specsDir` (needed because `specsDir` can be the shadow `.agent/specs/`, whose parent is *not* the project root — `main()` already has this exact `.agent`-detection logic for its label-prefix choice; the new code reuses the same detection to compute the project root correctly in both the normal and shadow-root cases).

### Ordered implementation plan

1. `core/skills/constitution-format/SKILL.md` — add the `Roadmap` column to the existing `### Artifacts` table documentation: semantics, the implicit-default-when-absent rule, the "some projects collapse it, some don't, independently of the `Changelog` column" note, and extend both existing worked examples (this repo's lockstep-packages example stays as-is with no `Roadmap` column; add a `Roadmap` column to the no-version-monorepo example showing each app with its own path).
2. `scripts/validate-specs.js` — add the `### Artifacts` table parser, the extra-roadmap-file discovery function, thread the project root parameter through `validateSpecsDir`/`validateSpecs`/`main()`, and wire discovery+validation into `validateSpecsDir` alongside the existing three constitution files.
3. `scripts/validate-specs.test.js` — the fixture matrix from Acceptance Criteria (2+ valid discovered files; missing declared path; malformed discovered file; duplicate-value dedup; no-`Roadmap`-column no-op against this repo's real table; malformed `### Artifacts` table).
4. `core/commands/code.md` — B2's "add a `## Now` line" step and B5's "remove this feature's `## Now` line" step both gain the cross-reference to B4's mapping rule, applied per resolved roadmap file. B1's slug-reuse sentence generalized to "every declared roadmap file."
5. `core/workflows/code.md` — mirror the B2/B5 summary bullets briefly.
6. Full regression pass: `npm run validate`, `npm run validate:specs`, `npm run build`, `npm run test:scripts`, `npm run test:packages`, `npm test`.
7. Dogfood B4/B5 for this feature's own delivery: since this repo's own `tech-stack.md` has no `Roadmap` column, this feature's own `## Now`/changelog handling is unaffected by its own change (a nice confirmation of the "zero behavior change for the common case" claim) — B4/B5 proceed exactly as they did for `multi-artifact-changelogs`.

Explicitly out of scope for this ordered plan: touching `k8s-lab` at all. That happens after this feature is approved and `status: done`, as a separate, already-agreed action directed by the human against a different project's specs — not part of this repo's implementation.

### Risks

- **`Roadmap` cross-referencing B4 instead of restating it could rot if B4's prose changes shape later** without someone remembering B2/B5 depend on it — mitigated by naming the exact step ("B4 step 1") rather than a vague "see above," and by this being the same cross-reference style already used elsewhere in `code.md`.
- **A hand-written markdown table is fragile to parse** (inconsistent spacing, missing trailing pipes, a stray blank line inside the table) — mitigated by failing loudly on anything that doesn't parse as a proper table, rather than guessing, per Decision 3.
- **Project-root resolution for shadow `.agent/specs/` roots** is easy to get backwards (one `dirname` too few or many) — mitigated by reusing `main()`'s existing, already-correct `.agent`-detection logic rather than writing new detection logic that could disagree with it.
- **Silent regression risk for every existing project without a `Roadmap` column** (including this repo) — mitigated by an explicit fixture asserting this repo's real `tech-stack.md` (no `Roadmap` column) produces zero newly-discovered files, run as part of B3.

### Testing strategy

`scripts/validate-specs.test.js`'s new fixture matrix (see Acceptance Criteria) plus a full-suite regression run (`npm test`) before and after, comparing counts exactly as done for `multi-artifact-changelogs`. No new runtime dependency — this stays inside the existing `front-matter`/`node:fs`/`node:path` toolset `validate-specs.js` already uses.

## Affected Areas

- `core/skills/constitution-format/SKILL.md` (Roadmap column docs)
- `scripts/validate-specs.js` (Artifacts-table parser, discovery, project-root threading)
- `scripts/validate-specs.test.js` (new fixture matrix)
- `core/commands/code.md` (B1 slug-reuse generalization; B2/B5 roadmap-routing cross-references)
- `core/workflows/code.md` (phase-summary mirror)

## Out of Scope

- Adjusting `k8s-lab`'s specs to actually use per-artifact roadmaps — a separate, already-agreed follow-up action against a different project, done after this feature is approved and `status: done`.
- Any change to `doc-review`'s checks (e.g. flagging a roadmap file that exists on disk but isn't declared in the `### Artifacts` table, or a `## Now` line sitting in the "wrong" file) — not requested; noted as a possible future enhancement, not built here.
- Any change to the `Changelog` column's existing behavior or the `multi-artifact-changelogs` feature's mechanism — this feature only adds a new column and reuses the existing mapping logic, it does not modify how changelog routing works.
- A parallel `### Roadmaps` table, or inferring roadmap separation from the `Versioning` column — both considered and rejected in Decision 1.

## Implementation Notes

Implemented per the approved Approach, in order, self-checked as each step
landed:

1. `core/skills/constitution-format/SKILL.md` — extended the existing
   `### Artifacts` subsection with a fifth `Roadmap` column: semantics
   (repo-relative path to that artifact's own roadmap, normally
   `<Root>/roadmap.md`), the implicit-default rule (empty cell or absent
   column → specs-root `roadmap.md`), and an explicit note that `Roadmap`
   is asymmetric with `Changelog` (a project can collapse one column without
   collapsing the other — this repo already proved the "keep Changelog
   separate, collapse Roadmap" combination is real, not hypothetical, since
   its own table needed zero changes here). Updated both worked examples: the
   lockstep-npm-packages example kept with no `Roadmap` column (illustrating
   the collapse); the no-version-monorepo example given its own `Roadmap`
   column with per-app paths.

2. `scripts/validate-specs.js` — added `checkConstitutionSchema()` (factored
   the existing version/date/status/section checks out of
   `validateConstitutionFile` so the new per-artifact roadmap validation
   could reuse the identical schema check rather than duplicating it),
   `parseArtifactsTable()` (a tolerant markdown-table parser scoped to the
   `### Artifacts` heading inside `tech-stack.md`'s body — maps header names
   to column indices so column order doesn't matter, returns `null` with no
   error when no such heading exists at all, but records an `error()` when
   the heading exists with no valid table or a malformed row follows, never a
   silent skip), `discoverExtraRoadmapPaths()` (collects and deduplicates
   declared `Roadmap` values against each other and against the specs-root
   roadmap's own repo-relative path), `validateExtraRoadmapFile()` and
   `validateDeclaredRoadmaps()` (resolve and validate each discovered path).
   `validateSpecsDir()` gained a `projectRoot` parameter (threaded from
   `validateSpecs()`/`main()`, using the exact same `.agent`-shadow
   detection `main()` already used for its `labelPrefix` choice, so a
   declared `Roadmap` path resolves against the true project root even when
   the specs root is the shadow `.agent/specs/`).

3. `scripts/validate-specs.test.js` — 8 new cases: multi-path discovery,
   missing declared file, wrong-sections file, dedup of a value shared by
   two rows, zero-behavior-change for a table with no `Roadmap` column
   (a direct regression guard mirroring this repo's own real table),
   malformed table (row/header cell-count mismatch), heading-with-no-table,
   and correct project-root resolution for a shadow `.agent/specs` root.

4. `core/commands/code.md` — B1's slug-reuse rule generalized from
   "in `roadmap.md`" to "in a roadmap file (the specs-root `roadmap.md`,
   or any per-artifact `Roadmap` file declared in `tech-stack.md`'s
   `### Artifacts` table)". B2's `## Now`-line step and B5's `## Now`-line
   removal step both gained a short cross-reference to B4's existing
   changelog-mapping rule (rather than a third restatement of the same
   algorithm), applied to the `Roadmap` column instead of `Changelog`.
   B4's mapping-rule intro gained one clause noting the same resolution is
   reused by B2/B5 for roadmap routing.

5. `core/workflows/code.md` — B1/B2/B5 phase-summary bullets each got a
   brief clause mirroring the additions above.

No divergence from the approved Approach. One deliberate scope boundary
honored: `k8s-lab` was not touched by any of the above — that's the
separately-agreed follow-up action, not part of this feature's
implementation.

## Validation

Summarized from the actual test results:

- **Pre-implementation baseline** (recorded before any implementation step):
  `npm run validate` PASS; `validate:specs` PASS (7 files); `npm run build`
  PASS; `npm run test:scripts` — 65/65; `npm run test:packages` — claude/opencode
  plugins pass `node --check index.js`, pi-extension 29/29; `npm test` PASS
  same counts.

- **Post-implementation full regression pass**: `npm run validate` PASS;
  `node scripts/validate-specs.js` PASS (7 files, unchanged count — confirms
  zero regression on this repo's own real specs, whose `tech-stack.md` has no
  `Roadmap` column); `npm run build` PASS; `npm run test:scripts` —
  **73/73** (65 baseline + 8 new); `npm run test:packages` — unchanged,
  pi-extension 29/29; `npm test` PASS, same counts.

- **No security review separately dispatched** — this feature is not
  security-sensitive (no auth, no secrets, no new external dependency; it's
  a markdown-table parser and a documentation/prose addition to `/code`'s
  own commands). `engineer` self-reviewed per the `code-review` skill at each
  step.

- **One tester coverage observation, not fixed** (a speculative edge case —
  a roadmap file existing but shaped unusually in a way not already covered
  by the missing-file/wrong-sections/malformed-table cases) — judged adequate
  as-is; the existing 8 cases already cover the meaningful failure modes
  stated in Acceptance Criteria, and adding a case for a vaguer,
  not-concretely-identified scenario would be speculative rather than
  evidence-driven.

## Documentation Review

`technical-writer` applied the `doc-review` skill against every doc this feature could plausibly affect: `README.md`, `AGENTS.md`, root and all 3 `packages/*/CHANGELOG.md`, `core/skills/constitution-format/SKILL.md`, `core/commands/code.md`, `core/workflows/code.md`, `specs/tech-stack.md`, `specs/mission.md`, `specs/roadmap.md`.

**Finding (High)**: all four changelogs (root `CHANGELOG.md` and all three `packages/*/CHANGELOG.md`) are missing an entry for this feature's own new capability — multi-artifact roadmap routing (a `Roadmap` column on the `### Artifacts` table, with B2/B5 routing `## Now` lines the same way B4 routes changelog entries). This feature's Affected Areas are all under `core/` or `scripts/`, which per `specs/tech-stack.md`'s `Built from:` note reach all four artifacts via `scripts/build.js` — the same fan-out that put the prior `multi-artifact-changelogs` feature's entry in all four files. This is a distinct, separate entry from that one, not a duplicate of it. Category: `Added`. This is the expected B4 outcome; B5 (next) adds these four entries.

**Dogfooded verification — roadmap routing for this feature's own change**: confirmed `specs/tech-stack.md`'s `### Artifacts` table has no `Roadmap` column, so per this feature's own new logic, its `## Now` line correctly lives only in the single specs-root `specs/roadmap.md` — exactly as it already does. No drift; this is the expected collapse-to-one-file behavior for this repo, working as designed.

**Self-consistency check — skill docs vs. implementation**: cross-checked `core/skills/constitution-format/SKILL.md`'s `### Artifacts` `Roadmap`-column documentation (semantics, implicit-default rule, dedup behavior) directly against what `scripts/validate-specs.js` actually implements (`parseArtifactsTable()`, `discoverExtraRoadmapPaths()`, `validateExtraRoadmapFile()`) — confirmed they match: column-name handling, default-when-absent behavior, and dedup logic are all consistent between the documented rule and the real code.

**Self-consistency check — cross-references in `core/commands/code.md`**: confirmed B1's generalized slug-reuse sentence, B2's and B5's cross-references to "B4 step 1's mapping rule," and B4's own acknowledging clause all read correctly in sequence and point at the right paragraph — no dangling or confusing cross-reference.

**General correctness**: no drift found in `README.md` or `AGENTS.md` (neither describes roadmap-handling mechanics in a way this feature made stale).

**Constitution files**: `specs/mission.md` needed no change (mission describes what the toolkit does, unaffected by this internal `/code` mechanism). `specs/roadmap.md` needed no change at this phase beyond the `## Now` line already present, correctly awaiting B5's mechanical removal.

No Medium or Low findings. The single actionable item — four pending changelog entries — is B5's normal job, not a documentation drift defect requiring separate resolution.

## Documentation Updates

Four new changelog entries added per this feature's affected areas:

- `CHANGELOG.md:18-22` — "Multi-artifact roadmap routing: `/code` B2 and B5 now
  route each feature's roadmap entries (`## Now`/`## Next`/`## Later`) to
  per-artifact roadmap files declared via an optional `Roadmap` column in
  `specs/tech-stack.md`'s `### Artifacts` table, using the same longest-prefix
  + fan-out mapping logic as changelogs; unspecified or empty `Roadmap` cells
  default to the specs-root roadmap." (toolkit-level framing, phases emphasized)

- `packages/claude-agent-tools-plugin/CHANGELOG.md:18-22` — "Multi-artifact
  roadmap support: the `/code` command bundled in this plugin now routes each
  feature's roadmap entries (`## Now`/`## Next`/`## Later`) to per-artifact
  roadmap files declared in `specs/tech-stack.md`, using the same longest-prefix
  routing logic as changelogs. Projects without separate roadmap files see no
  change — one shared roadmap continues to work as before." (plugin-specific
  framing, behavioral description)

- `packages/opencode-agent-tools-plugin/CHANGELOG.md:18-22` — "Multi-artifact
  roadmap support: the `/code` command bundled in this plugin now routes each
  feature's roadmap entries (`## Now`/`## Next`/`## Later`) to per-artifact
  roadmap files declared in `specs/tech-stack.md`, using the same longest-prefix
  routing logic as changelogs. Projects without separate roadmap files see no
  change — one shared roadmap continues to work as before." (plugin-specific
  framing, behavioral description)

- `packages/pi-agent-tools-extension/CHANGELOG.md:18-23` — "Multi-artifact
  roadmap support: the `/code` command bundled in this extension now routes each
  feature's roadmap entries (`## Now`/`## Next`/`## Later`) to per-artifact
  roadmap files declared in `specs/tech-stack.md`, using the same longest-prefix
  routing logic as changelogs. Projects without separate roadmap files see no
  change — one shared roadmap continues to work as before." (extension-specific
  framing, behavioral description)

Roadmap entry removed: `specs/roadmap.md:11` — the "## Now" line for this
feature (`- Multi-artifact roadmap handling — branch \`main\` —
specs/features/multi-artifact-roadmaps.md`) was removed per constitution-format's
"## Now line lifecycle" (exempt from update-gate, mechanical removal during B5).
