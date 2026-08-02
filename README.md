# Agent coding tools

Code structure:

```txt
agent-tools/
│
├── README.md
├── package.json                  # npm package metadata
│
├── core/                         # assistant-independent assets
│   │
│   ├── skills/
│   │   ├── code-review/
│   │   │   ├── SKILL.md
│   │   │   ├── references/
│   │   │   │   └── checklist.md
│   │   │   └── scripts/
│   │   │       └── analyze.py
│   │   │
│   │   └── architecture-review/
│   │       └── SKILL.md
│   │
│   ├── agents/
│   │   ├── security-reviewer.md
│   │   ├── backend-expert.md
│   │   └── frontend-expert.md
│   │
│   ├── workflows/
│   │   ├── feature-development.md
│   │   ├── bug-investigation.md
│   │   └── release.md
│   │
│   ├── rules/
│   │   ├── coding-style.md
│   │   ├── git.md
│   │   └── security.md
│   │
│   └── prompts/
│       └── system-overrides.md
│
├── adapters/
│   │
│   ├── claude-code/
│   │   ├── install.js
│   │   ├── settings.json
│   │   ├── skills/
│   │   ├── agents/
│   │   └── commands/
│   │
│   ├── opencode/
│   │   ├── install.js
│   │   ├── opencode.json
│   │   ├── skills/
│   │   ├── agents/
│   │   └── commands/
│   │
│   └── pi/
│       ├── install.js
│       ├── extensions/
│       ├── skills/
│       └── settings.json
│
├── extensions/
│   │
│   ├── mcp/
│   │   ├── rosetta.json
│   │   └── github.json
│   │
│   └── tools/
│       ├── repo-analyzer/
│       └── dependency-checker/
│
└── scripts/
    ├── install-claude.js
    ├── install-opencode.js
    ├── install-pi.js
    └── validate.js
```

## Design principles

### Skills are the foundation

Use the Agent Skills standard as the canonical format:

Example: `core/skills/code-review/SKILL.md`

```md
---
name: code-review
description: Reviews code for correctness, maintainability and security.
---

# Code Review

When reviewing:

1. Check correctness.
2. Check error handling.
3. Check tests.
4. Check security implications.

Use the repository conventions.
```

This will work unchanged in:

- Claude Code
- OpenCode
- Pi

### Agents are thin wrappers

Keep agent definitions declarative.

Example: `core/agents/security-reviewer.md`

```md
---
name: security-reviewer
description: Security-focused code reviewer
model_preference:
  - claude-sonnet
  - gpt-5
permissions:
  edit: false
---

You are a security reviewer.

Focus on:
- authentication
- authorization
- secrets
- injection
- dependencies
```

Then adapters translate:

```txt
core/agents/security-reviewer.md

        |
        +---- Claude Code
        |       .claude/agents/security-reviewer.md
        |
        +---- OpenCode
        |       .opencode/agents/security-reviewer.md
        |
        +---- Pi
                extension/agent definition
```

### Workflows are the "product layer"

Example: `core/workflows/feature-development.md`

```md
# Feature Development

## Phase 1: Understand

Run:
- explorer agent
- architecture skill

Output:
- implementation plan

## Phase 2: Implement

Run:
- backend agent
- frontend agent

## Phase 3: Validate

Run:
- test agent
- security reviewer

## Phase 4: Finalize

Generate:
- changelog
- documentation
```

Different platforms implement this differently:

| Platform    | Workflow implementation             |
| ----------- | ----------------------------------- |
| Claude Code | commands + skills + plugin hooks    |
| OpenCode    | commands + agents + task delegation |
| Pi          | extension orchestration             |

### Use npm as the distribution mechanism

Example packages:

```txt
@dpurge/agent-tools
@dpurge/agent-tools-opencode
@dpurge/agent-tools-claude
@dpurge/pi-agent-tools-extension
@dpurge/agent-tools-pi
```

Installation:

```sh
claude plugin install @dpurge/agent-tools-claude
opencode plugin install @dpurge/agent-tools-opencode # or: npm install -g @dpurge/agent-tools-opencode
pi install npm:@dpurge/pi-agent-tools-extension
pi install npm:@dpurge/agent-tools-pi
```

### The manifest

There is one source of truth: `agent-tools.yaml`

```yaml
name: dpurge-agent-tools

skills:
  - code-review
  - architecture-review

agents:
  - security-reviewer
  - backend-expert

workflows:
  - feature-development
  - release

mcp:
  - rosetta
  - github

targets:
  claude:
    enabled: true

  opencode:
    enabled: true

  pi:
    enabled: true
```

### Validation in CI

CI should test: `npm run validate`

which checks:

- every skill has `SKILL.md`
- frontmatter is valid
- agent names are unique
- workflows reference existing agents
- adapters are synchronized
