---
version: 2
status: approved
updated: 2026-09-16
---

# Mission

## Problem

`agent-tools` solves the problem of authoring AI-agent assets — skills, agent
roles, workflows, commands, and rules — once and shipping them consistently
across multiple AI coding hosts, instead of hand-maintaining divergent copies
per host (`README.md`: "Author the assets once under `core/`... let the
build assemble a platform-specific package for each target").

## Users

- Contributors and maintainers who author or change the portable assets
  under `core/` (`AGENTS.md`: "Quick orientation for coding agents working in
  this repository").
- End users who install the toolkit into their own projects to get its slash
  commands and subagent roles inside Claude Code, OpenCode, or Pi
  (`package.json` description: "Portable AI agent toolkit with skills,
  subagents, workflows, and rules for Claude Code, OpenCode, and Pi";
  `README.md` "Installing into a project").

## Value proposition

One authored source, kept from drifting via `agent-tools.yaml` as the
enforced manifest — `scripts/validate.js` fails validation on any mismatch
between the manifest and `core/`, so the three targets cannot silently
diverge (`AGENTS.md`: "`agent-tools.yaml` is the shipping manifest").

Explicitly, per direction given in this conversation: the toolkit is
host-neutral by design and prioritizes working well with open-weight models
and with OpenCode and Pi, even though Claude Code may be the primary
day-to-day coding host for whoever is using it. No target should become the
toolkit's hidden source of truth for a host-specific format at the expense of
the other two.

## Non-goals

- Not a hosted or managed service — a local CLI plus generated packages
  (`README.md` "Packages" table; no server/hosting component exists in the
  repo).
- Does not reimplement each host's execution engine — it configures and
  extends what Claude Code, OpenCode, and Pi already provide (agents,
  skills, commands), rather than building a new one.
- `/code` is not a general project-management tool — it drives one
  feature/bugfix at a time through specification, implementation,
  validation, and documentation (`core/workflows/code.md`), not a backlog,
  ticketing, or multi-feature planning system.
