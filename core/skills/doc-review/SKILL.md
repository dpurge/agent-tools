---
name: doc-review
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
