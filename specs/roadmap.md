---
version: 4
status: approved
updated: 2026-09-16
---

# Roadmap

## Now

- `/feature-development` is retired — its command and workflow files are
  removed, and `/code` (with the valuable pieces it had that `/code` was
  missing — an explicit "ask questions" step, engineer-written tests,
  mandatory self-review, richer design content, and the delivery-summary
  shape — ported over first) is now this toolkit's only feature/bugfix
  workflow.
- The Pi subagent extension is built and tested: ported Pi's official
  `examples/extensions/subagent/` into `packages/pi-agent-tools-extension`
  (29 tests, verified against the live Pi CLI), so `/code` and other
  commands can dispatch real subagents inside Pi.
- `/code`'s Part B is a concrete feature/bugfix loop — specification →
  implementation → validation → documentation review → documentation update
  — with `coordinator`/`tester` agents, one persistent
  `specs/features/<slug>.md` file per feature (`feature-spec-format`
  skill), replanning support (a feature can trigger an approved constitution
  change mid-flight), and `scripts/validate-specs.js` enforcing both file
  formats after every write.

## Next

- Exercise the feature/bugfix loop for real, end to end, on an actual
  feature or bugfix — so far it has only been designed and wired, not
  dry-run the way the constitution phase was. This is now the only path
  forward for feature/bugfix work, since `/feature-development` no longer
  exists as a fallback.
- Watch whether the model-preference additions (Anthropic/OpenAI via
  OpenRouter, plus a native `model:` alias for Claude Code) actually route
  the way intended across all three hosts once used for real.

## Later

- Nothing currently deferred beyond the above — the feature/bugfix loop is
  the mechanism, not a placeholder for a later formal spec/plan system.

## Out of scope

- Nothing currently ruled out.
