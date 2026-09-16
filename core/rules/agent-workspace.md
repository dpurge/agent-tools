# Agent Workspace

## `.agent/tmp/`

Use `.agent/tmp/` for scratch files an agent needs only for the current
session — intermediate notes, one-off scripts, draft output you're iterating
on before it becomes a real deliverable. Never put a real deliverable there;
it is expected to be gone once the session ends and must never be relied on
by another session or by `/code`'s own state (that's what `specs/` and
`.agent/specs/` are for).

## `.agent/specs/`

A shadow copy of `specs/`, used only when a project already has a `specs/`
directory that doesn't follow the `constitution-format`/`feature-spec-format`
skills' shapes (see `core/commands/code.md`'s specs-root resolution step).
`/code` reads and writes it exactly like `specs/` when it's in use, but it is
never committed — it's local working state for driving `/code` on a project
whose real `specs/` means something else.

## Keep both out of git

Before writing to `.agent/tmp/` or `.agent/specs/` for the first time in a
project, check that `.gitignore` covers `.agent/` (as a directory entry,
`.agent/`) — add it if missing. Do this regardless of host; don't assume the
project's own tooling already excludes it.
