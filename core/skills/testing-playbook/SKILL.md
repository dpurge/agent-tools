---
name: testing-playbook
description: Test and verify changes effectively in any language or project — baselines, narrowest-first runs, counting passes and skips (a skip is not a pass), fail-before and pass-after proof, fakes and injected clocks, end-to-end smoke runs, negative and boundary cases, budgeted real calls, independent verification of delegated work. Use when implementing, validating or reviewing a change.
version: 1.0.0
---

# Testing Playbook

## Purpose

A green run proves only what actually ran. Most wasted time and most missed
defects come from the same few habits: trusting a summary, not counting what
was skipped, testing only the happy path, and never proving that a new test can
fail. These practices are language- and project-neutral. Use the project's own
commands (check `package.json`, `Makefile`, CI config, `README.md`); never
assume one exists.

## Before you change anything

- Run the project's real build and test commands once for a **baseline**, so a
  later failure can be labelled regression or pre-existing.
- Note what the suite needs to run fully (a database, an environment variable,
  a service, a cluster). If that is missing, say so now: those tests will skip.

## While you work

- Run the **narrowest** test first (one file, one test name), then the package,
  then everything. Fast feedback first, full confidence last.
- Write the test for a fix or a rule **before** the fix when you can, and see
  it fail for the right reason. A test you never saw fail may assert nothing.
  When you cannot run the old code (no stash, no worktree, a change you may not
  revert), say so, and check the fix by reading the code against the test.
- Prefer deterministic tests: injected clocks instead of sleeps, fake servers
  instead of real services, fixed seeds, throwaway schemas or temp directories
  that clean up after themselves, and no dependence on test order.
- Cover the negative and boundary cases, not only the happy path: invalid
  input, the largest and smallest values, empty and missing values, multibyte
  text cut mid-character, integer overflow, a dependency that is down, a
  cancelled context, a duplicate, a retry.

## Count what ran

- Read the totals, not only the exit code. Run verbosely when the runner hides
  skips (`go test -v`, `pytest -rs`, `jest --verbose`) and report
  **pass / skip / fail** per package.
- A skipped test is **unverified**, not passed. Find out why it skipped
  (a missing environment variable, a service that is not running), supply the
  dependency if you safely can, and otherwise list exactly what stayed
  unexercised.
- Never report a result you did not observe, and never summarize a failure as a
  guess: quote the exact output.

## Beyond unit tests

- Run the **real artifact** once against realistic input (the built binary with
  the rendered or deployed config, the CLI on a sample file) and read what it
  does. Configuration that compiles and unit-tests clean can still fail at
  startup.
- Check negative paths of that artifact too: a malformed config, a missing
  file, an old or renamed key, a bad credential.
- When a user interface changed, look at it in a real browser at the widths the
  project supports and measure overflow, rather than inferring layout from
  component tests.
- When you rename or remove something, search the whole repository for the old
  name afterwards, including docs, manifests and fixtures.
- Run the formatter and linter the project uses, and check line endings before
  a scripted edit (`file name`): rewriting a CRLF file as LF shows up as a
  whole-file diff.

## Real external calls (models, APIs, paid or slow services)

- Prove the logic with fakes first. Use real calls only to confirm the
  integration, and budget them: a small fixed number, a timeout on each, a
  pre-check that the service is idle, and cleanup of anything they created.
- Say how many real calls you made and what each cost.

## Checking someone else's work

- Subagent and teammate summaries are claims, not evidence. Before relaying
  one, verify at least one non-trivial claim yourself with a command or by
  reading the file. Check that each requested edit exists, and that a stated
  fact matches the code.
- When a brief references numbered items (acceptance criteria, steps), re-read
  the source file first so the numbers are right.

## Scripted edits

- `sed -i` differs between GNU and BSD/macOS (the latter needs an empty
  suffix argument), and `date`, `grep -P` and `xargs` differ too. Prefer an
  editor tool or a small script you can read back; check the diff after.
- Never use a destructive command as "cleanup" inside a test or script: no
  write-mode version-control commands, even ones that seem to do nothing.

## Report

End with what ran (commands, counts), what passed, what failed with output,
what was skipped or not run and why, and what remains unverified.
