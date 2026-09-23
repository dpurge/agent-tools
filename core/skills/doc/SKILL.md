---
name: doc
description: Audit project documentation against the current code for consistency, readability, and correctness, and produce an evidence-linked findings report.
version: 1.0.0
---

# Documentation Review Skill

## Purpose

Check that the documentation still tells the truth about the code. Code changes;
docs drift. Find the gaps and report them with enough evidence that each one can
be verified and fixed quickly.

Use this skill when reviewing README files, `docs/`, `doc/`, and any other
markdown in the repository.

## What to Check

**Correctness (highest priority)** — does the doc match the code *as it is now*?

- Commands, scripts, and flags that no longer exist or were renamed.
- File paths, directory names, and module names that have moved.
- Package names, versions, and install instructions.
- Code snippets and examples that would not run.
- API/behavior descriptions that contradict the implementation.

**Release wiring (high priority)** — a missing changelog-before-tag step means a
published release silently omits its own changelog entry.

- Scope: `.github/workflows/*.yml`/`*.yaml` only. If no `.github/workflows/`
  exists but another CI config does (`.gitlab-ci.yml`, `Jenkinsfile`, etc.),
  note it as not inspected — do not build vendor-specific parsers.
- Tag creation: a step containing `git tag`, `git push --tags`,
  `gh release create`, or a known tagging action (`softprops/action-gh-release`,
  `actions/create-release`, `changesets/action`).
- Changelog-rewrite coverage: a step *before* the tag step invoking a known
  tool (`changesets`, `release-please`, `standard-version`, `changelogen`,
  `git-cliff`, `auto-changelog`) or a repo script — verify by reading the
  script, not by its name, that it moves `## [Unreleased]` into a versioned
  section.
- Multi-artifact: if `tech-stack.md` declares an `### Artifacts` table, check
  coverage per declared artifact, not once for the repo — a lockstep release
  that versions only the root changelog is a separate finding per skipped
  package changelog.
- Not a finding: no curated changelog exists (no `CHANGELOG.md` with a
  `## [Unreleased]` heading) — nothing to move; or the artifact's
  `Versioning` is `none` and nothing tags it.
- A finding requires all of: the workflow creates a tag, AND at least one
  declared (or implicit single) artifact's changelog has a non-empty
  `## [Unreleased]` body, AND no step before the tag step rewrites it.
  Severity **High** — a published release's changelog silently omits that
  release; a tool's auto-generated notes (e.g.
  `gh release create --generate-notes`) are not a substitute for the
  curated file.
- Ordering counts: a rewrite step that exists but runs *after* the tag step
  is still a finding — report it as ordering, not "missing."
- Never auto-edit a workflow file — report a concrete suggested fix (e.g.
  "insert an Unreleased-to-versioned step before the tag step, running
  `<script>`"); the fix goes through this project's normal
  approval-gated path like any other change.
- Quote step names/paths as evidence, never inline secret expressions (e.g.
  `${{ secrets.NPM_TOKEN }}`) — mask per the security rule if a quoted line
  contains one.

**Consistency** — does the documentation agree with itself?

- Terminology, naming, and capitalization used consistently.
- Cross-references and links that resolve.
- Duplicated content that has diverged.
- Structure and headings that match siblings.

**Readability** — can a new reader follow it?

- Clear, concise, well-structured prose; no dead or contradictory sections.
- Correct spelling and grammar.
- Formatting that renders (balanced code fences, valid tables and lists).

## Method

1. Enumerate the documentation files in scope.
2. For each claim about the code, verify it against the actual code
   (`Grep`/`Glob`/`Read`). Prefer primary evidence over assumption.
3. Record each problem with a precise location and the code evidence that
   contradicts it.
4. Assign severity by real impact:
   - **High** — wrong/misleading; a reader following it would fail (bad command,
     wrong package name, broken example).
   - **Medium** — inaccurate or inconsistent but recoverable; stale references.
   - **Low** — readability, grammar, formatting, or style.
5. Do not report speculative issues. If unsure whether something is wrong, verify
   or leave it out.

## Report Format

Produce a report grouped by severity, most severe first:

```md
## Documentation Review — <scope>

**Summary:** N issues (H High, M Medium, L Low) across F files.

### High

1. `path/to/file.md:LINE` — <one-line problem>
   - **Why:** <why this is a problem for a reader>
   - **Evidence:** `path/to/code:LINE` (what the code actually says/does)
   - **Fix:** <concrete suggested change>

### Medium
...

### Low
...
```

Every finding must include a `path:line` location, a short reason, and a concrete
suggested fix. Include the code evidence when the issue is a code/doc mismatch.
If there are no issues, say so explicitly.
