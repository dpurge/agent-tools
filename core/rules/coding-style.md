# Coding Style

Apply these defaults to all code unless a repository convention says otherwise.

## General

- Prefer clarity over cleverness. Optimize for the next reader.
- Match the surrounding code: naming, structure, comment density, and idioms.
- Keep functions small and single-purpose (SRP). Avoid duplication (DRY).
- Do not add abstractions before they are needed (YAGNI).
- Keep changes focused; avoid unrelated refactoring in the same change.

## Naming

- Use descriptive, intention-revealing names.
- Booleans read as predicates (`isReady`, `hasAccess`).
- Avoid abbreviations that are not already common in the codebase.

## Structure

- One responsibility per module or file.
- Keep public interfaces small and explicit.
- Fail fast: validate inputs at boundaries, not deep in the call stack.

## Errors

- Handle expected failure modes explicitly; never swallow errors silently.
- Include actionable context in error messages.
- Do not use exceptions for normal control flow.

## Comments

- Explain *why*, not *what*; the code already shows what.
- Remove commented-out code before finishing.

## Formatting

- Rely on the project formatter (e.g. Prettier) and linter (e.g. ESLint).
- Do not hand-format in ways the tooling will override.
