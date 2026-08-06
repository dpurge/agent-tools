# AGENTS.md

Quick orientation for coding agents working in this repository.

## What this repo is

`agent-tools` is a portable toolkit for AI coding environments. The same authored
assets are packaged for:

- Claude Code
- OpenCode
- Pi

## First things to understand

1. **`core/` is the source of truth for portable content**
   - `core/skills/`
   - `core/agents/`
   - `core/workflows/`
   - `core/commands/`
   - `core/rules/`
2. **`agent-tools.yaml` is the shipping manifest**
   - If you add, remove, or rename a skill/agent/workflow/command, update the
     manifest in the same change.
3. **`packages/*` are generated build outputs**
   - Do not manually edit generated bundled assets there.
   - The only normal hand-edited files in packages are entrypoints/tests such as
     `package.json`, `index.js`, and `*.test.js`.
4. **Build/install behavior should stay shared**
   - Reuse `scripts/lib/install-common.js` when possible.
   - Avoid duplicating path/manifest logic in multiple scripts.
5. **There are now two install modes**
   - copy install: `install-*` scripts
   - editable install: `install-editable-*` scripts
   - editable uninstall: `uninstall-editable-*` scripts

## Important files

- `README.md` — human-facing project overview
- `agent-tools.yaml` — manifest for shipped assets and targets
- `scripts/cli.js` — root CLI entrypoint
- `scripts/build.js` — assembles generated packages
- `scripts/validate.js` — validates manifest and repo wiring
- `scripts/lib/install-common.js` — shared install/build helper logic
- `scripts/install-claude.js`
- `scripts/install-opencode.js`
- `scripts/install-pi.js`
- `scripts/install-editable-claude.js`
- `scripts/install-editable-opencode.js`
- `scripts/install-editable-pi.js`
- `adapters/opencode/index.js`
- `packages/opencode-agent-tools-plugin/runtime.js`
- `scripts/uninstall-editable-claude.js`
- `scripts/uninstall-editable-opencode.js`
- `scripts/uninstall-editable-pi.js`
- `README.md` editable install/uninstall section

## Working rules

- When adding a new asset under `core/`, also register it in `agent-tools.yaml`.
- When changing packaging/install behavior, update shared helpers first if the
  logic applies across targets.
- For Pi editable mode, prefer the development adapter in `adapters/pi/index.js`
  over generated package contents.
- OpenCode now has both filesystem-linked commands and best-effort runtime command
  registration through its plugin entrypoint.
- If you change editable install behavior, update the matching editable uninstall
  behavior and the docs in `README.md` too.
- Keep docs in sync with code, especially `README.md` and this file.
- Prefer small, manifest-driven changes over editing generated outputs.

## Validation commands

Run these after meaningful changes:

```sh
npm run validate
npm run build
npm run test:scripts
npm run test:packages
npm test
```

## Tests

- Root script tests live in `scripts/*.test.js`.
- Package-specific tests live inside `packages/*`.
- `npm test` runs validation, root script tests, and package tests.

## Common safe workflows

### Add a new skill

1. Create `core/skills/<name>/SKILL.md`
2. Add `<name>` to `agent-tools.yaml` under `skills:`
3. Run `npm run validate`
4. Run `npm run build`

### Change install/build behavior

1. Check whether the logic belongs in `scripts/lib/install-common.js`
2. Update the target installer(s) and/or `scripts/build.js`
3. If the change affects editable installs, update `install-editable-*` too
4. Update editable uninstall docs if paths changed
5. Run `npm test`

### Review a packaging issue

1. Inspect `agent-tools.yaml`
2. Inspect `scripts/build.js`
3. Inspect `scripts/lib/install-common.js`
4. Verify behavior with `npm run build` or `npm test`

## Avoid

- Do not treat `packages/*/skills`, `packages/*/agents`, etc. as source files.
- Do not add a `core/` asset without registering it in the manifest.
- Do not update one installer and forget the others when the behavior is meant to
  be shared.
