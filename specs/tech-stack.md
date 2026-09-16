---
version: 3
status: approved
updated: 2026-09-16
---

# Tech Stack

## Languages & runtimes

- Node.js >= 20, ES modules (`package.json`: `"engines": {"node": ">=20"}`,
  `"type": "module"`).
- Python >= 3.11 + [`uv`](https://github.com/astral-sh/uv), only for the
  `research-*` skills' PEP 723 scripts (`README.md` "Prerequisites").
- [`typst`](https://typst.app), only for `/research --format pdf`
  (`README.md` "Prerequisites").

## Frameworks & libraries

- `commander` — CLI argument parsing (`scripts/cli.js`).
- `js-yaml` — parses `agent-tools.yaml`.
- `front-matter` — parses skill/agent/workflow/command frontmatter for
  validation and assembly.
- `zod` — schema validation.
- `chalk` — CLI output formatting.
- `eslint`, `prettier` — dev-only lint/format tooling.

(`package.json` `dependencies`/`devDependencies`.)

## Infrastructure & tooling

- npm scripts drive everything: `validate`, `validate:specs`, `build`,
  `test:scripts`, `test:packages`, `test`, `set-version`, and the
  `install*`/`install-editable-*` family (`package.json` `scripts`).
- Node's built-in test runner (`node --test`) for both root scripts
  (`scripts/*.test.js`) and each package's own tests.
- GitHub Actions: `.github/workflows/build.yml` runs on every PR to `main`
  (`validate` → `validate:specs` → `build` → `test:scripts` →
  `test:packages` → `npm pack --dry-run`, on Node 20 and 22);
  `.github/workflows/release.yml` is a manual `workflow_dispatch` that
  bumps the version, builds, tests, packs every package, tags, and
  publishes a GitHub Release.

## Key conventions

- `core/` is the single source of truth for portable assets; `packages/*` is
  generated output except entrypoints (`package.json`, `index.js`,
  `*.test.js`), which are the only hand-edited files there (`AGENTS.md`).
- `agent-tools.yaml` is the enforced manifest — adding, removing, or
  renaming a skill/agent/workflow/command requires updating it in the same
  change, or `scripts/validate.js` fails (`AGENTS.md`).
- Shared install/build logic belongs in `scripts/lib/install-common.js`;
  avoid duplicating path/manifest logic per target (`AGENTS.md`).
- Two install modes exist per target: copy install (`install-*`) and
  editable install (`install-editable-*`, symlinks/shims pointing at this
  checkout's `core/`) with matching `uninstall-editable-*` scripts
  (`AGENTS.md`; `README.md` "Editable installs").
- Host-neutral by design, per explicit direction: prioritize compatibility
  with OpenCode and Pi and with open-weight models routed via OpenRouter
  (`agent-tools.yaml` `models:` tiers; `README.md` "Running on OpenRouter"),
  even when Claude Code is the host actually being used day to day. A
  Claude-specific file (e.g. `CLAUDE.md`) must not become a silent second
  source of truth for a project's own orientation docs (e.g. `AGENTS.md`).
- Model tiering, per explicit direction: `coordinator`/`architect`/
  `reviewer` (planning, architecture, coordination) get big, capable models;
  `engineer`/`tester`/`researcher`/`technical-writer` (mechanical
  implementation, validation, research, write-up) get smaller/cheaper ones
  — reflected in each `core/agents/*.md`'s `model` (Claude Code alias) and
  `model_preference` (OpenRouter, cheap/open-weight first) fields.
- `/code`'s specs live under a resolved specs root, normally `specs/`, but
  `.agent/specs/` (never committed — `agent-workspace` rule) when a
  project's own `specs/` predates `/code` and doesn't match its format;
  `/code` never overwrites an incompatible `specs/`.
- Scratch files an agent needs only for the current step go in
  `.agent/tmp/`, never the specs root or a committed path
  (`agent-workspace` rule).
- `specs/memory.md` (per the `memory-format` skill) is a peer convention
  alongside the constitution files — a shared, append-only, grep-only log
  of durable cross-session knowledge, validated by the same
  `scripts/validate-specs.js`.
