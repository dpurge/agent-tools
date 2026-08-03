---
name: story
description: Write a fiction chapter inside an ebook project — maintain the cast and plot in .story/, plan with the user, write grounded in fact-checked research, run an adversarial review, and wire the chapter into ebook.yml.
version: 1.0.0
agents:
  - reviewer
  - engineer
skills:
  - fiction-writing
  - fiction-review
---

# Story Workflow

This workflow is runnable as the `/story` slash command. The authoritative,
step-by-step instructions live in
[`core/commands/story.md`](../commands/story.md).

## When to use

- writing a fiction chapter for a `kind: generic` ebook project
- continuing or rewriting a story that has a `.story/ACTORS.md` + `PLOT.md`

## Phases (summary)

1. **Orient & load state** — find `ebook.yml`; read `.story/ACTORS.md` +
   `PLOT.md`; if missing, brainstorm and create them (web-researched, fact-checked).
2. **Plan the chapter** — brainstorm against `PLOT.md`; **propose plot twists mined
   from real-life stories via web search**; keep it unpredictable and consistent.
3. **Approval gate** — the user approves; save the plan into `PLOT.md`.
4. **Write** — `fiction-writing`: engaging, unpredictable, fact-grounded; relatable
   antagonists; **no magic solutions** — conflicts resolved by work, growth, or
   trading favors.
5. **Adversarial review** — `reviewer` + `fiction-review` finds and fixes
   predictability, thin characters, unearned resolutions, factual errors, drift.
6. **Save & wire** — write the chapter `.md`, wire it into `ebook.yml`, update
   `ACTORS.md`/`PLOT.md`.

## Roles & skills

- `reviewer` — adversarial critique via the `fiction-review` skill.
- `engineer` — file writes and `ebook.yml` wiring.
- `fiction-writing` — craft, the `.story/` state formats, research/grounding and
  no-magic-solution rules.

## Research & fact-checking

Ground the world in **real, verified** detail — places, crafts, history, industry
standards, science, future-project plans, agriculture, husbandry, and real
events/people. Never assert an unverified real-world fact.

## Prerequisites

- Web access for research/fact-checking; `ebook-cli` (from `dpurge/cli-tools`) to
  build the book.

## Success criteria

- `.story/ACTORS.md` + `PLOT.md` present and self-consistent
- chapter plan approved and saved to `PLOT.md`
- chapter unpredictable, characters relatable, no magic solutions, facts checked
- chapter wired into `ebook.yml`; state files updated
