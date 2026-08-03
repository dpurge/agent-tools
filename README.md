# Agent Tools

Portable AI agent toolkit — skills, subagents, workflows, rules, and commands that
work across **Claude Code**, **OpenCode**, and **Pi** from a single source of truth.

Author the assets once under `core/`, describe them in one manifest
(`agent-tools.yaml`), and let the build assemble a platform-specific package for
each target.

**Commands:** software workflows (`/feature-development`, `/bug-investigation`,
`/release`, `/doc-review`), research write-ups (`/research`), Anki flashcards
(`/anki`), ebooks and language readers (`/ebook`), and fiction (`/story`).

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
model_preference:
  - "z-ai/glm-5.2"
  - "deepseek/deepseek-v4-flash"
  - "minimax/minimax-m3"
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

The six roles are `researcher`, `architect`, `engineer`, `reviewer`,
`technical-writer`, and `translator`.

### Workflows and commands are the product layer

Workflows describe an end-to-end process; a matching command makes it runnable as a
slash command. `feature-development` is both: the workflow
(`core/workflows/feature-development.md`) documents the process, and the command
(`core/commands/feature-development.md`) is installed as `/feature-development` on
each platform.

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

skills:      # review · research · anki · phraseforge (+42 languages) · fiction
  - code-review
  - research-core
  - phraseforge-core
  # … 55 total

agents:      # architect · engineer · researcher · reviewer · technical-writer · translator
  - reviewer
  - translator
  # …

workflows:   # commands share the same names
  - feature-development
  - research
  - ebook
  - story
  # …

commands: [feature-development, bug-investigation, release, doc-review, research, anki, ebook, story]

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
│   │   ├── security-review/ · doc-review/          # review skills
│   │   ├── research-core/ · research-web/ · research-typst/   # research (RAG + MDX + A5 PDF)
│   │   ├── anki-comp/ · anki-vocabulary/           # flashcard authoring
│   │   ├── phraseforge-core/ · phraseforge-ebook/ · phraseforge-lang-<iso> (×42)  # language readers
│   │   └── fiction-writing/ · fiction-review/      # fiction authoring + adversarial review
│   ├── agents/                   # architect, engineer, researcher, reviewer, technical-writer, translator
│   ├── workflows/                # feature-development, bug-investigation, release, doc-review, research, anki, ebook, story
│   ├── commands/                 # feature-development, bug-investigation, release, doc-review, research, anki, ebook, story
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

Only `package.json`, `index.js`, and `*.test.js` are committed inside each
`packages/*` directory. Everything else there (`skills/`, `agents/`, `workflows/`,
`commands/`, `rules/`, `mcp/`, `plugin.json`, …) is generated by the build and
git-ignored.

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

## Installing into a project

### Using the CLI (recommended for development)

`install:dev` builds the packages and links the `agent-tools` command globally:

```sh
npm run install:dev

# then, in any project:
agent-tools install claude      # or: opencode | pi
agent-tools install claude --force
agent-tools install claude --target-dir /path/to/project
```

### Using the install scripts directly

```sh
npm run install:claude -- --target=/path/to/project
npm run install:opencode -- --target=/path/to/project --force
npm run install:pi -- --target=/path/to/project
```

Each installer copies the skills, agents, workflows, commands, and rules into the
platform directory (`.claude/`, `.opencode/`, `.pi/`), installs the plugin or
extension, and wires up platform configuration:

- **Claude Code** — generates `CLAUDE.md` from the rules, installs commands to
  `.claude/commands/`, and merges `.claude/settings.json`.
- **OpenCode** — installs commands to `.opencode/commands/` and merges
  `.opencode/opencode.json`.
- **Pi** — installs the extension to `.pi/extensions/agent-tools` and merges
  `.pi/config.json`.

### From a GitHub Release

Releases attach package tarballs. Download the one you need, then:

```sh
npm install -g ./dpurge-agent-tools-<version>.tgz
agent-tools install claude
```

## CLI

```txt
agent-tools validate            Validate the toolkit wiring
agent-tools build               Assemble the platform packages from core/
agent-tools install <target>    Install into a project (claude | opencode | pi)
    -f, --force                 overwrite existing files
    -t, --target-dir <dir>      install location (default: current directory)
```

## npm scripts

| Script | Purpose |
| ------ | ------- |
| `npm run validate` | Validate manifest, assets, and package wiring |
| `npm run build` | Assemble each `packages/*` from `core/` |
| `npm test` | `validate` + `test:packages` |
| `npm run test:packages` | Run each package's own tests |
| `npm run set-version <version>` | Set one version across root, packages, and manifest |
| `npm run install:dev` | Build and `npm link` the `agent-tools` CLI |
| `npm run install:claude` \| `:opencode` \| `:pi` | Install into a target project |

## Running on OpenRouter (cost-effective models)

By default the agents prefer inexpensive OpenRouter models rather than frontier
Anthropic models. Routing lives in `agent-tools.yaml` `models:` (the single source
of truth) and each agent's `model_preference`:

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

### Claude Code (via a gateway)

Claude Code speaks the Anthropic API, so route it through an OpenRouter→Anthropic
gateway (an OpenRouter-compatible Anthropic endpoint, or a router such as
`claude-code-router`). It does **not** read `model_preference` — set the models via
env/router using the slugs above:

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

Validation fails if the manifest references a file that doesn't exist, a workflow
references an unknown agent or skill, or a package is missing its entry point — so
the manifest and `core/` cannot drift apart silently.

## Build and release

`npm run build` assembles every target: it copies the portable `core/` assets plus
the MCP configs, the `README` and `LICENSE`, and the adapter configuration into each
`packages/*` directory, and generates the Claude `plugin.json`. The result is a set
of self-contained, packable directories.

Releases are cut from GitHub Actions:

- **`.github/workflows/build.yml`** runs on every pull request to `main`:
  `validate` → `build` → `test:packages` → `npm pack --dry-run` on Node 20 and 22.
- **`.github/workflows/release.yml`** is triggered manually (`workflow_dispatch`)
  with a `patch` / `minor` / `major` bump. It bumps the version across the
  workspace, builds and tests, packs every package into tarballs, creates the
  `v<version>` tag, and publishes a GitHub Release with the tarballs attached.
