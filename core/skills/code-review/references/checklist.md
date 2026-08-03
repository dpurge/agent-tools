# Code Review Checklist

A quick reference for the `code-review` skill. Not every item applies to every
change; use judgment.

## Correctness

- [ ] Does the change do what it claims, and satisfy the requirements?
- [ ] Are edge cases and empty/boundary inputs handled?
- [ ] Are error and failure paths handled (not swallowed)?
- [ ] Could this introduce a regression in existing behavior?

## Design

- [ ] Is the change as simple as it can be?
- [ ] Are names clear and consistent with the codebase?
- [ ] Is duplication avoided; are abstractions justified?
- [ ] Is the change focused, without unrelated edits?

## Security

- [ ] Any untrusted input validated before use?
- [ ] Any secrets, tokens, or PII exposed in code, logs, or errors?
- [ ] Any injection risk (SQL, shell, HTML) from unescaped data?
- [ ] Are new dependencies necessary and trustworthy?

## Tests

- [ ] Are new paths covered by tests?
- [ ] Do tests assert behavior, not implementation detail?
- [ ] Are tests isolated, deterministic, and idempotent?

## Operability

- [ ] Adequate logging/observability for new failure modes?
- [ ] Any config, migration, or deployment impact called out?
- [ ] Backwards compatibility considered for public interfaces?
