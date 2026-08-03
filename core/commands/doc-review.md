---
description: Audit all project documentation against the current code, report discrepancies with evidence, and fix them after you approve.
argument-hint: <optional path or glob to limit scope; defaults to the whole repo>
---

# Documentation Review

Audit the project's documentation against the code as it is **now**, report what
has drifted, and fix it only after approval. Use the `doc-review` skill for the
method and report format.

**Scope:** $ARGUMENTS

If no scope is given, review all documentation in the repository.

---

## 1. Collect the documentation

Find the docs in scope: `README.md`, everything under `docs/` and `doc/`, and any
other `*.md` in the repository. **Exclude** `node_modules/`, git-ignored build
output, and generated content inside `packages/*` (skills/agents/workflows/…). If
a scope argument was given, limit to it.

List the files you will review.

## 2. Audit against the code

Use the `technical-writer` agent with the `doc-review` skill. For each
documentation claim about the code, verify it against the actual code
(`Grep`/`Glob`/`Read`) — do not assume. Look for:

- **Correctness** — commands, flags, paths, package names, versions, and examples
  that no longer match the code.
- **Consistency** — terminology, cross-references/links, and duplicated content
  that has diverged.
- **Readability** — dead or contradictory sections, grammar, and formatting that
  does not render (unbalanced code fences, broken tables/lists).

## 3. Present the report

Produce the report exactly in the `doc-review` skill format: a summary line, then
findings grouped **High → Medium → Low**, each with:

- `path/to/file.md:LINE` — the problem in one line
- **Why** it's a problem
- **Evidence** — `path/to/code:LINE` when it's a doc/code mismatch
- **Fix** — a concrete suggested change

Report only verifiable issues. If there are none, say so.

## 4. 🚦 Approval gate — propose fixes

Ask the user which findings to fix (all, a subset, or none). **Stop and wait** for
an explicit decision. Do not edit any documentation before this.

## 5. Apply approved fixes

Use the `technical-writer` agent to apply only the approved fixes. Make the
smallest change that makes each doc accurate; preserve voice and structure; do not
invent features. Then summarize what changed, grouped by file, and note anything
left unaddressed.
