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
     `package.json`, `index.js`, `*.test.js`, and `CHANGELOG.md`.
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

`npm run validate:specs` is different: it checks a *project's* `specs/`
directory (this repo's own, by default) against the `constitution-format`,
`feature-spec-format`, and `memory-format` skills, not this toolkit's own
`core/` wiring. Run it after any write under `specs/` — the `/code` command
does this itself after every such write. Besides the formats it enforces
closeout: an error for a `done` spec still listed in a roadmap `## Now` line
or with a "Not started." closeout section, and a `stalled:` warning for open
work not updated in more than 2 days. `--today=YYYY-MM-DD` (or
`VALIDATE_SPECS_TODAY`) fixes the date for tests. E3: a `done` spec updated on
or after `CI_REVIEW_REQUIRED_FROM` (2026-10-24, a grandfathering date compared
with the spec's `updated`, never today) must record its CI/release decision in
*Documentation Review* (`needs change: yes/no` or a `CI review: not applicable`
line). After editing `scripts/validate-specs.js`, run `npm run build:validator`.

`adapters/claude-code/hooks/closeout-guard.mjs` is a Claude Code `Stop` hook,
installed and removed together with the target guard (`applyGuardHook` /
`removeGuardHook` in `scripts/lib/install-common.js`; `--no-hooks` skips both).
When git shows changes under the project's `specs/` (or `.agent/specs/`), it
runs the validator and blocks the stop (exit 2, reason on stderr) only for the
closeout errors: a closed feature still in `## Now`, a `done` spec with a
"Not started." section, a `done` spec with no CI/release decision. It never
blocks when it cannot verify (no git, no validator, `stop_hook_active`), and
`AGENT_TOOLS_CLOSEOUT=off` disables it. Guarantees (its own limits, not the
host's; state in `<tmpdir>/agent-tools-closeout/<session>.json`): at most 2
blocks per session, never the same message twice, at most about 1200 characters
of feedback (5 error lines of 300 characters, then `(and N more; ...)`), a 10 s
validator limit inside a 20 s hook timeout, and any failure (unwritable or
corrupt state, validator timeout or crash) lets the session end. Claude Code
only: OpenCode and Pi have no equivalent and are not affected. Tests:
`scripts/closeout-guard.test.js`; keep the caps and the 20 s `timeout` in
`CLAUDE_HOOKS` in step.

Call-site rule (`/code` ground rules and closeout checklist): every new
non-test function, type, config key or route needs a non-test call site shown
as `grep -n` evidence; the coordinator and B3's tester re-run the grep.

## Tests

- Root script tests live in `scripts/*.test.js`.
- Package-specific tests live inside `packages/*`.
- `npm test` runs `validate`, `validate:specs`, root script tests, and
  package tests, in that order.

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

<!-- agent-tools:rules:start -->
## Agent Tools Rules

### Agent Workspace

#### `.agent/tmp/`

Use `.agent/tmp/` for scratch files an agent needs only for the current
session — intermediate notes, one-off scripts, draft output you're iterating
on before it becomes a real deliverable. Never put a real deliverable there;
it is expected to be gone once the session ends and must never be relied on
by another session or by `/code`'s own state (that's what `specs/` and
`.agent/specs/` are for).

#### `.agent/specs/`

A shadow copy of `specs/`, used only when a project already has a `specs/`
directory that doesn't follow the `constitution-format`/`feature-spec-format`
skills' shapes (see `core/commands/code.md`'s specs-root resolution step).
`/code` reads and writes it exactly like `specs/` when it's in use, but it is
never committed — it's local working state for driving `/code` on a project
whose real `specs/` means something else.

#### Keep both out of git

Before writing to `.agent/tmp/` or `.agent/specs/` for the first time in a
project, check that `.gitignore` covers `.agent/` (as a directory entry,
`.agent/`) — add it if missing. Do this regardless of host; don't assume the
project's own tooling already excludes it.


### Using Library APIs

Do not write a call to a library, framework or CLI from memory: names,
signatures and options change between versions.

- Before you rely on an API, confirm it in the code the project installed, at
  the version it pinned: search the repository for existing uses, then print the
  signature with the language toolchain (`go doc`, `inspect`, the package's
  `.d.ts`, `javap`, `cargo doc`), and compile or run a small use of it.
- Label anything you could not confirm as "unverified" in your notes and in the
  report. Never present a guessed call as working.
- For the exact commands per language, use the `api-verification` skill.


### Coding Style

Apply these defaults to all code unless a repository convention says otherwise.

#### General

- Prefer clarity over cleverness. Optimize for the next reader.
- Match the surrounding code: naming, structure, comment density, and idioms.
- Keep functions small and single-purpose (SRP). Avoid duplication (DRY).
- Do not add abstractions before they are needed (YAGNI).
- Keep changes focused; avoid unrelated refactoring in the same change.

#### Naming

- Use descriptive, intention-revealing names.
- Booleans read as predicates (`isReady`, `hasAccess`).
- Avoid abbreviations that are not already common in the codebase.

#### Structure

- One responsibility per module or file.
- Keep public interfaces small and explicit.
- Fail fast: validate inputs at boundaries, not deep in the call stack.

#### Errors

- Handle expected failure modes explicitly; never swallow errors silently.
- Include actionable context in error messages.
- Do not use exceptions for normal control flow.

#### Comments

- Explain *why*, not *what*; the code already shows what.
- Remove commented-out code before finishing.

#### Formatting

- Rely on the project formatter (e.g. Prettier) and linter (e.g. ESLint).
- Do not hand-format in ways the tooling will override.


### Git

#### Commits

- Make small, coherent commits that each leave the tree in a working state.
- Write imperative, present-tense subjects: "Add release workflow", not "Added".
- Keep the subject under ~72 characters; explain the *why* in the body.
- Do not mix unrelated changes in one commit.
- Do not add tool or model attribution to commit messages.

#### Branches

- Work on a feature branch, not directly on the default branch.
- Rebase or merge from the default branch before opening a pull request.

#### Safety

- Never rewrite published history or force-push shared branches.
- Never commit secrets, credentials, or generated build artifacts.
- Treat `git reset --hard`, branch deletion, and history edits as destructive:
  confirm intent before running them.

#### Pull requests

- Describe what changed and why; link related issues.
- Keep pull requests reviewable in size; split large work where possible.


### Operations and Targets

Commands that touch a cluster, a cloud account, a container runtime or a
database act on whatever target they resolve, and the default is often the
wrong one: a shell's default configuration may include production.

#### Name the target

- Pass the target explicitly on every command: `kubectl` and `helm` with
  `--kubeconfig <absolute path>` (plus `--context` and `-n` when they matter),
  `gcloud` with `--project` (and `--account`), `aws` with `--profile` and
  `--region`, `docker` with `--context`, `terraform` with its workspace,
  database clients with host and database name.
- Never rely on environment variables (`KUBECONFIG`, `AWS_PROFILE`,
  `CLOUDSDK_CORE_PROJECT`, `DOCKER_HOST`), the "current" context or a default
  config: they differ per shell. Use absolute paths, because a relative path
  stops resolving after a `cd`.
- Before the first mutating command of a session, print the effective target
  with the same explicit flags (for example `kubectl ... config current-context`,
  `docker --context ... info`, `gcloud ... config list`) and compare it with
  what the project documents. Stop on a mismatch. Use the dev targets the
  project records (its constitution or README), not ones you guessed.
- Prefer the project's task runner (Make, Task, npm scripts): it pins the
  target for you.

#### Read before you write

- Start read-only: `get`, `describe`, `logs`, `list`, `--dry-run`, `plan`,
  `helm template`. Mutate only after the read-only view looks right.
- Production or any shared target only on the user's explicit request, named
  in the request. If the intended target is unreachable, say so; never try
  another context, account or project.
- After a command or script fails halfway, inspect the state it left before
  retrying: many deploy scripts are not atomic.

#### Hygiene

- Read secrets into shell variables inside the command that uses them. Never
  print them, write them into the repo, or put them in a prompt.
- Stop every background process you started (port-forwards, servers) and check
  the port is free afterwards. Kill by your own command line, not by a broad
  pattern.
- Give network, cluster and long-running commands a timeout, and poll with a
  bounded loop. When one times out, report it instead of retrying silently.
- Send long output to a file and read the tail or grep for errors.

For per-tool patterns and a pre-flight checklist, use the `safe-operations`
skill.


### Security

#### Secrets

- Never hardcode credentials, tokens, or keys. Read them from the environment.
- Never log, print, or echo secret values. Mask them as `[REDACTED:<type>]`.
- Do not commit `.env` files or private keys.

#### Input and output

- Treat all external input as untrusted; validate and normalize at boundaries.
- Use parameterized queries; never build SQL by string concatenation.
- Encode output for its destination (HTML, shell, SQL) to prevent injection.

#### Dependencies

- Prefer well-maintained dependencies; review new ones before adding them.
- Keep dependencies patched; watch for known vulnerabilities.

#### Access

- Apply least privilege to tokens, service accounts, and file permissions.
- Enforce authorization on every request, not just authentication.
- Separate environments; never point tools at production by default.

#### Handling sensitive data

- Do not read, store, or transmit PII/PHI/PCI unless explicitly required.
- When sensitive data must be handled, minimize scope and retention.

<!-- agent-tools:rules:end -->
