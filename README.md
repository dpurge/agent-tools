# Agent Tools

Portable AI agent toolkit — skills, subagents, workflows, rules, and commands that
work across **Claude Code**, **OpenCode**, and **Pi** from a single source of truth.

Author the assets once under `core/`, describe them in one manifest
(`agent-tools.yaml`), and let the build assemble a platform-specific package for
each target.

**Commands:** spec-driven development (`/code`), software workflows
(`/bug`, `/release`, `/doc`), research write-ups
(`/research`), Anki flashcards (`/anki`), ebooks and language readers
(`/ebook`), and fiction (`/story`).

## Quick orientation for contributors and coding agents

If you are changing this repo for the first time, start here:

- **Portable source of truth lives in `core/`** — skills, agents, workflows,
  commands, and rules are authored there.
- **`agent-tools.yaml` decides what ships** — if you add or rename a skill,
  agent, workflow, or command, update the matching manifest list in the same
  change.
- **`packages/*` are generated outputs** — only committed sources there are
  package entrypoints like `package.json`, `index.js`, tests, and `CHANGELOG.md`.
  Do not hand-edit generated bundled assets.
- **Build/install logic lives in `scripts/`** — especially `build.js`,
  `validate.js`, `cli.js`, and `lib/install-common.js`.
- **Validate before and after edits** — run `npm run validate`, `npm run build`,
  and `npm test`.

Typical tasks:

- **Add a new portable asset** → create it under `core/`, register it in
  `agent-tools.yaml`, then run `npm run validate`.
- **Change what gets packaged/installed** → update manifest-driven logic, not just
  a generated package directory.
- **Change installer/build behavior** → prefer shared helpers in
  `scripts/lib/install-common.js` so build and install stay aligned.
- **Change docs** → keep `README.md` and `AGENTS.md` accurate.

See also [`AGENTS.md`](AGENTS.md) for a compact repo-specific brief aimed at coding
agents.

## Concepts

### Skills are the foundation

Skills use the Agent Skills format (`SKILL.md` with frontmatter) and are the home
for domain expertise. They work unchanged across all three platforms.

`core/skills/code-review/SKILL.md`:

```md
---
name: code-review
description: Perform a structured code review focused on correctness, maintainability, and security.
version: 1.0.0
---

# Code Review Skill
...
```

### Agents are thin, role-based wrappers

Agents describe a **role**, not a domain — expertise lives in skills. Each agent
declares the tools and permissions it needs.

`core/agents/reviewer.md`:

```md
---
name: reviewer
description: Read-only critic that inspects designs, code, and tests against intent.
version: 1.0.0
model: opus
model_preference:
  - "z-ai/glm-5.2"
  - "deepseek/deepseek-v4-flash"
  - "minimax/minimax-m3"
  - "anthropic/claude-opus-5"
  - "openai/gpt-5.1"
tools:
  - Read
  - Grep
  - Glob
permissions:
  edit: false
  write: false
  bash: false
skills:
  - code-review
  - architecture-review
  - security-review
---

# Reviewer
...
```

`model` is the alias Claude Code's native subagent loader reads (it ignores
`model_preference`); `model_preference` is an ordered list of OpenRouter
slugs for OpenCode and Pi, cheaper/open-weight options first.

The eight roles are `researcher`, `architect`, `engineer`, `reviewer`,
`technical-writer`, `translator`, `coordinator`, and `tester`.

### Workflows and commands are the product layer

Workflows describe an end-to-end process; a matching command makes it runnable as a
slash command. `code` is both: the workflow
(`core/workflows/code.md`) documents the process, and the command
(`core/commands/code.md`) is installed as `/code` on each platform.

### One manifest

`agent-tools.yaml` is the single source of truth for what ships:

```yaml
schemaVersion: 1
name: agent-tools
version: 0.1.0

# Cost-effective OpenRouter model routing (see "Running on OpenRouter" below).
models:
  provider: openrouter
  default: "deepseek/deepseek-v4-flash"
  free_policy: balanced
  tiers:
    cheap: "deepseek/deepseek-v4-flash"
    strong: "z-ai/glm-5.2"
    free: "nvidia/nemotron-3-ultra-550b-a55b:free"
    # … long_context, multilingual

skills:      # review · research · anki · phraseforge (+42 languages + shared format skill) · fiction · spec-driven dev
  - code-review
  - research-core
  - phraseforge-core
  - phraseforge-format
  - constitution-format
  # … 59 total

agents:      # architect · coordinator · engineer · researcher · reviewer · tester · technical-writer · translator
  - reviewer
  - translator
  # …

workflows:   # commands share the same names
  - code
  - research
  - ebook
  - story
  # …

commands: [code, bug, release, doc, research, anki, ebook, story]

extensions:
  mcp: [rosetta, github, filesystem]

targets:
  claude:   { adapter: adapters/claude-code, package: "@dpurge/claude-agent-tools-plugin" }
  opencode: { adapter: adapters/opencode,    package: "@dpurge/opencode-agent-tools-plugin" }
  pi:       { adapter: adapters/pi,          package: "@dpurge/pi-agent-tools-extension" }
```

*Abridged — see [`agent-tools.yaml`](agent-tools.yaml) for the full skill, agent,
workflow, and command lists.*

## Repository structure

```txt
agent-tools/
├── agent-tools.yaml              # manifest: the single source of truth
├── package.json                  # @dpurge/agent-tools + the `agent-tools` CLI
├── LICENSE
│
├── core/                         # assistant-independent assets (source of truth)
│   ├── skills/
│   │   ├── code-review/           # SKILL.md + references/ + scripts/analyze.py
│   │   ├── architecture-review/SKILL.md
│   │   ├── security-review/ · doc/          # review skills
│   │   ├── research-core/ · research-web/ · research-typst/   # research (RAG + MDX + A5 PDF)
│   │   ├── anki-comp/ · anki-vocabulary/           # flashcard authoring
│   │   ├── phraseforge-core/ · phraseforge-ebook/ · phraseforge-lang-<iso> (×42)  # language readers
│   │   ├── constitution-format/ · feature-spec-format/ · memory-format/  # /code's specs/ file formats
│   │   └── fiction-writing/ · fiction-review/      # fiction authoring + adversarial review
│   ├── agents/                   # architect, coordinator, engineer, researcher, reviewer, tester, technical-writer, translator
│   ├── workflows/                # code, bug, release, doc, research, anki, ebook, story
│   ├── commands/                 # code, bug, release, doc, research, anki, ebook, story
│   ├── rules/                    # coding-style, git, security
│   └── prompts/                  # system-overrides
│
├── adapters/                     # per-platform configuration + dev adapter
│   ├── claude-code/settings.json
│   ├── opencode/opencode.json
│   └── pi/index.js               # runs the extension against core/ during development
│
├── extensions/
│   ├── mcp/                      # rosetta, github, filesystem MCP server configs
│   └── tools/repo-analyzer/      # standalone repository analysis tool
│
├── packages/                     # publishable packages, assembled by the build
│   ├── claude-agent-tools-plugin/     # package.json + index.js (+ generated assets)
│   ├── opencode-agent-tools-plugin/   # package.json + index.js (+ generated assets)
│   └── pi-agent-tools-extension/      # package.json + index.js + index.test.js
│
└── scripts/
    ├── cli.js                    # the `agent-tools` command
    ├── build.js                  # assemble packages from core/
    ├── validate.js               # validate wiring
    ├── set-version.js            # set one version across the workspace
    ├── test-packages.js          # run each package's tests
    ├── install-claude.js
    ├── install-opencode.js
    └── install-pi.js
```

Only `package.json`, `index.js`, `*.test.js`, and `CHANGELOG.md` are committed
inside each `packages/*` directory. Everything else there (`skills/`, `agents/`,
`workflows/`, `commands/`, `rules/`, `mcp/`, `plugin.json`, …) is generated by the
build and git-ignored.

## Packages

| Package | Target | Entry |
| ------- | ------ | ----- |
| `@dpurge/agent-tools` | root CLI + raw assets | `scripts/cli.js` (bin) |
| `@dpurge/claude-agent-tools-plugin` | Claude Code | `index.js` (Claude manifest: `plugin.json`) |
| `@dpurge/opencode-agent-tools-plugin` | OpenCode | `index.js` |
| `@dpurge/pi-agent-tools-extension` | Pi | `index.js` |

## Getting started

### Prerequisites

- **Node.js >= 20** — for the toolkit build, validation, and CLI.
- **Python >= 3.11 + [`uv`](https://github.com/astral-sh/uv)** — only for the
  `research-*` skills, whose tools are [PEP 723](https://peps.python.org/pep-0723/)
  scripts run via `uv run --script` (the RAG index downloads a small embedding
  model on first use; all search tools are key-free).
- **[`typst`](https://typst.app)** — only for `/research --format pdf` (A5 PDF).

```sh
git clone https://github.com/dpurge/agent-tools.git
cd agent-tools
npm install
npm run validate      # check the wiring
npm run build         # assemble the platform packages
npm test              # validate + run package tests
```

## Contributing

For a fast repo-specific brief, see [`AGENTS.md`](AGENTS.md).

When contributing:

- author portable assets under `core/`
- update `agent-tools.yaml` in the same change when shipped assets change
- prefer shared script logic in `scripts/lib/install-common.js`
- run `npm run validate`, `npm run build`, and `npm test` before finishing

## Installing into a project

### Using the CLI (recommended for development)

`install:dev` does **not** install the toolkit into a target project by itself. It
only prepares your local checkout for development use:

1. runs `npm run build`
2. runs `npm link`

That means it assembles the generated `packages/*` contents and then globally links
this repo's `agent-tools` CLI so your machine can run the local development version.

```sh
npm run install:dev

# then, in any project:
agent-tools install claude      # or: opencode | pi
agent-tools install claude --force
agent-tools install claude --target-dir /path/to/project
```

The linked `agent-tools install <target>` command rebuilds first, then runs the
matching installer script for `claude`, `opencode`, or `pi`.

### Editable installs (like `pip install -e`)

For local development, the toolkit also supports an **editable** install mode.
Unlike the normal copy-based installers, editable installs point the target host at
this checkout directly, so changes under `core/` are available in later sessions
without reinstalling or rebuilding.

#### Install

```sh
# global (all three targets install to the host's user-level config dir
# when --target / --target-dir is omitted)
npm run install:editable:pi
npm run install:editable:claude
npm run install:editable:opencode

# project-local
npm run install:editable:claude -- --target=/path/to/project
npm run install:editable:opencode -- --target=/path/to/project

# or, via the linked CLI:
agent-tools install-editable pi
agent-tools install-editable claude
agent-tools install-editable opencode
agent-tools install-editable claude --target-dir /path/to/project
agent-tools install-editable opencode --target-dir /path/to/project
```

Editable mode by target:

- **Pi** — installs a global extension shim under `~/.pi/agent/extensions/`
  (or `$PI_CODING_AGENT_DIR/extensions/` if that env var is set; project-local
  under `.pi/extensions/` if `--target` / `--target-dir` is given). That shim
  loads `adapters/pi/index.js`, which reads the repo's `core/` assets directly
  at runtime.
- **Claude Code** — with no `--target` / `--target-dir`, creates symlinks from
  `$CLAUDE_CONFIG_DIR/{skills,agents,workflows,commands,rules}` (defaulting to
  `~/.claude/`) into this repo's `core/` directories, and merges the rules
  section directly into `~/.claude/CLAUDE.md` — Claude Code's own user-level
  memory file — rather than generating one. With `--target`, it installs
  project-locally under `.claude/{skills,agents,workflows,commands,rules}` and
  regenerates the project's `CLAUDE.md` instead.
- **OpenCode** — with no `--target` / `--target-dir`, creates symlinks from
  `$OPENCODE_CONFIG_DIR/{skills,agents,workflows,commands,rules}` (defaulting
  to `${XDG_CONFIG_HOME:-~/.config}/opencode/`) into this repo's `core/`
  directories, writes its `opencode.json`, and installs a small plugin shim
  under `plugins/agent-tools/index.js`. With `--target`, it installs
  project-locally under `.opencode/` instead.

For Pi, new sessions see `core/commands` automatically; for a running Pi session,
use `/reload` or restart Pi. For Claude/OpenCode, restart the host if a running
session does not pick up the changed files.

For OpenCode specifically, agent-tools now also tries to register slash commands
at runtime through the plugin entrypoint instead of relying only on passive
filesystem discovery.

#### Uninstall

Editable installs can be removed with matching uninstall scripts:

```sh
npm run uninstall:editable:pi
npm run uninstall:editable:claude
npm run uninstall:editable:opencode
npm run uninstall:editable:claude -- --target=/path/to/project
npm run uninstall:editable:opencode -- --target=/path/to/project

# or, via the linked CLI:
agent-tools uninstall-editable pi
agent-tools uninstall-editable claude
agent-tools uninstall-editable opencode
agent-tools uninstall-editable claude --target-dir /path/to/project
agent-tools uninstall-editable opencode --target-dir /path/to/project
```

What each uninstaller removes:

- **Pi global editable install**
  - `~/.pi/agent/extensions/agent-tools.ts`
  - then restart Pi or run `/reload` in a running session
- **Pi project-local editable install**
  - `/path/to/project/.pi/extensions/agent-tools.ts`
- **Claude global editable install**
  - `~/.claude/{skills,agents,workflows,commands,rules}` symlinks
  - only the agent-tools rules section is stripped from `~/.claude/CLAUDE.md`
    (marker-bounded); the rest of that file — a real, user-owned file — is
    left untouched, and the file itself is deleted only if nothing else
    remained in it
- **Claude project-local editable install**
  - `.claude/{skills,agents,workflows,commands,rules}` symlinks
  - `CLAUDE.md`
- **OpenCode global/project-local editable install**
  - `{skills,agents,workflows,commands,rules}` symlinks
  - `plugins/agent-tools`
  - removes `./plugins/agent-tools` from `opencode.json`

### Using the install scripts directly

```sh
npm run install:claude -- --target=/path/to/project
npm run install:opencode -- --target=/path/to/project --force
npm run install:pi -- --target=/path/to/project
```

Each installer copies the manifest-listed skills, agents, workflows, commands, and
shared rules into the platform directory (`.claude/`, `.opencode/`, `.pi/`),
installs the plugin or extension, and wires up platform configuration:

- **Claude Code** — merges the rules into the project's `AGENTS.md` (creating
  it if needed) and writes `CLAUDE.md` as exactly `@AGENTS.md` — Claude
  Code's own import syntax — so `CLAUDE.md` never becomes a second source of
  truth; installs commands to `.claude/commands/`; merges `.claude/settings.json`.
- **OpenCode** — installs commands to `.opencode/commands/`, installs the plugin
  to `.opencode/plugins/agent-tools`, and merges `.opencode/opencode.json`
  including a plugin entry so the runtime plugin can load.
- **Pi** — installs manifest-listed assets to `.pi/{skills,agents,workflows,commands}`,
  copies rules to `.pi/rules/`, installs the extension to
  `.pi/extensions/agent-tools`, and merges `.pi/config.json`.

#### Pi install layout

A Pi installation ends up with both workspace assets and an extension:

```txt
.pi/
├── skills/
├── agents/
├── workflows/
├── commands/
├── rules/
├── extensions/
│   └── agent-tools/
└── config.json
```

This split is intentional: the portable authored assets live directly under `.pi/`,
while the runtime extension code lives under `.pi/extensions/agent-tools`.

### From a GitHub Release

Releases attach package tarballs. Download the one you need, then:

```sh
npm install -g ./dpurge-agent-tools-<version>.tgz
agent-tools install claude
```

## CLI

```txt
agent-tools validate                    Validate the toolkit wiring
agent-tools validate-specs              Validate a project's specs/ (constitution + feature-spec formats)
    -t, --target-dir <dir>              project to check (default: current directory)
agent-tools build                       Assemble the platform packages from core/
agent-tools install <target>            Install into a project (claude | opencode | pi)
    -f, --force                         overwrite existing files
    -t, --target-dir <dir>              install location (default: current directory)
agent-tools install-editable <target>   Install in editable mode (claude | opencode | pi)
    -f, --force                         overwrite existing files
    -t, --target-dir <dir>              project-local install location
agent-tools uninstall-editable <target> Uninstall editable mode (claude | opencode | pi)
    -t, --target-dir <dir>              project-local install location
```

## npm scripts

| Script | Purpose |
| ------ | ------- |
| `npm run validate` | Validate manifest, assets, and package wiring |
| `npm run validate:specs` | Validate a project's `specs/` against the constitution, feature-spec, and memory formats |
| `npm run build` | Assemble each `packages/*` from `core/` |
| `npm run test:scripts` | Run root-level script and CLI integration tests |
| `npm run test:packages` | Run each package's own tests |
| `npm test` | `validate` + `validate:specs` + `test:scripts` + `test:packages` |
| `npm run set-version <version>` | Set one version across root, packages, and manifest |
| `npm run install:dev` | Build and `npm link` the `agent-tools` CLI |
| `npm run install:claude` \| `:opencode` \| `:pi` | Copy-install into a target project |
| `npm run install:editable:claude` \| `:opencode` \| `:pi` | Editable install using symlinks/shims |
| `npm run uninstall:editable:claude` \| `:opencode` \| `:pi` | Remove editable install artifacts |

## Running on OpenRouter (cost-effective models)

By default the agents prefer inexpensive OpenRouter models rather than frontier
Anthropic/OpenAI models — each agent's `model_preference` (used by OpenCode and
Pi) lists the cheap/free OpenRouter picks first, with Anthropic and OpenAI
models — still routed through OpenRouter — appended after them as fallbacks.
Routing lives in `agent-tools.yaml` `models:` (the single source of truth) and
each agent's `model_preference`:

| Tier | Model | ~Price /M (in/out) |
| ---- | ----- | ------------------ |
| cheap (default) | `deepseek/deepseek-v4-flash` | $0.09 / $0.18 |
| long-context | `minimax/minimax-m3` | $0.24 / $0.96 |
| strong | `z-ai/glm-5.2` | $0.63 / $1.98 |
| multilingual | `qwen/qwen3.5-plus-20260420` | low |
| free | `nvidia/nemotron-3-ultra-550b-a55b:free` | $0 |

`free_policy: balanced` — simple roles (`researcher`, `technical-writer`) try the
free model first; heavier roles (`architect`, `reviewer`, `engineer`, `translator`)
use cheap paid models first. **Free tiers are rate-limited and may train on
submitted data**, so the balanced policy keeps private/heavy work on paid models.
Slugs and prices drift — re-check them on openrouter.ai and update
`agent-tools.yaml`.

Each agent's frontmatter also carries a `model:` field — Claude Code's own
native subagent alias (`opus`, `sonnet`, `haiku`, `fable`, or `inherit`).
Claude Code reads this directly and ignores `model_preference` entirely;
OpenCode and Pi read `model_preference` and ignore `model`.

### OpenCode (wired)

`adapters/opencode/opencode.json` already sets the OpenRouter provider, the default
model, and a per-agent model map. Authenticate once, then run:

```sh
opencode
# in OpenCode: /connect  → choose OpenRouter, paste your key
```

### Pi

Point Pi at OpenRouter (an OpenAI-compatible endpoint) and set the default model
(config keys depend on your Pi version — confirm against its docs):

```json
{
  "provider": { "baseURL": "https://openrouter.ai/api/v1", "apiKey": "$OPENROUTER_API_KEY" },
  "model": "deepseek/deepseek-v4-flash"
}
```

### Claude Code

Claude Code reads each agent's `model:` field natively — no setup needed; this
is the default. To instead route Claude Code itself through OpenRouter (e.g. to
reach a specific OpenRouter-hosted model by slug for the whole session), put it
behind an OpenRouter→Anthropic gateway (an OpenRouter-compatible Anthropic
endpoint, or a router such as `claude-code-router`) — this bypasses each
agent's `model:` field and applies one model session-wide via env/router:

```sh
export ANTHROPIC_BASE_URL="https://<your-openrouter-anthropic-gateway>"
export ANTHROPIC_API_KEY="$OPENROUTER_API_KEY"
export ANTHROPIC_MODEL="deepseek/deepseek-v4-flash"
export ANTHROPIC_SMALL_FAST_MODEL="deepseek/deepseek-v4-flash"
```

## Authoring assets

1. Add the file under `core/` (`skills/<name>/SKILL.md`, `agents/<name>.md`,
   `workflows/<name>.md`, or `commands/<name>.md`).
2. Register its name in the matching list in `agent-tools.yaml`.
3. Run `npm run validate`.

Validation fails if the manifest references a file that doesn't exist, if `core/`
contains an unlisted skill/agent/workflow/command, if a workflow references an
unknown agent or skill, or if a package is missing its entry point — so the
manifest and `core/` cannot drift apart silently.

## Build and release

`npm run build` assembles every target: it copies only the skills, agents,
workflows, and commands listed in `agent-tools.yaml`, plus the shared rules, the
selected MCP configs, the `README` and `LICENSE`, and the adapter configuration into
each `packages/*` directory, and generates the Claude `plugin.json`. The result is a
set of self-contained, packable directories.

Releases are cut from GitHub Actions:

- **`.github/workflows/build.yml`** runs on every pull request to `main`:
  `validate` → `validate:specs` → `build` → `test:scripts` → `test:packages` →
  `npm pack --dry-run` on Node 20 and 22.
- **`.github/workflows/release.yml`** is triggered manually (`workflow_dispatch`)
  with a `patch` / `minor` / `major` bump. It bumps the version across the
  workspace, builds and tests, packs every package into tarballs, creates the
  `v<version>` tag, and publishes a GitHub Release with the tarballs attached.
