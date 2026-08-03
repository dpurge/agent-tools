---
description: Write a fiction chapter inside an ebook project — maintain the cast (.story/ACTORS.md) and plot (.story/PLOT.md), plan the chapter with you, write it grounded in fact-checked research, run an adversarial review, and wire it into ebook.yml.
argument-hint: <what should happen this chapter, or a rewrite request>
---

# /story

Write one fiction chapter for the ebook project in the current directory (or the
nearest `ebook.yml` above it). Follow the phases. **Do not skip the approval gate;
never write content or grammar from memory where a real-world fact is involved —
research and fact-check it (see the `fiction-writing` skill).**

**Request:** $ARGUMENTS

---

## 1. Orient & load state

- Find the nearest `ebook.yml` (a `kind: generic` book). If none, ask where the
  project is or offer to scaffold one.
- Read `.story/ACTORS.md` and `.story/PLOT.md` (next to `ebook.yml`).
- **If either is missing, create it with the user first** (before any chapter):
  brainstorm the cast and the overall plot, **researching the web** for
  inspiration in real events, people, places, crafts, history, industry, science,
  future projects, agriculture and husbandry. Fact-check what you use. Write
  `ACTORS.md` (name, appearance, personality, goals, likes, dislikes per actor)
  and `PLOT.md` (premise, arc, open threads). Get the user's OK on these before
  continuing.

## 2. Plan the chapter (chat)

Brainstorm this chapter with the user against `PLOT.md`:

- Propose beats that pose **real difficulty** with **no magic escape**.
- **Propose plot twists you find in real-life stories via web search** — mine real
  events for the surprising-yet-inevitable turn. Keep it unpredictable.
- Check every beat for consistency with `ACTORS.md` and `PLOT.md`.

## 3. 🚦 Approve the plan

Present the chapter plan. **Stop and wait** for explicit approval. Then **save the
approved plan into `PLOT.md`** under `## Chapters` (keep the file self-consistent
and consistent with `ACTORS.md`).

## 4. Write the chapter

Use the `fiction-writing` skill. Write at chapter length in genre convention:
engaging, unpredictable, sensory, fact-checked. Colorful, likeable, tricky
characters; antagonists with relatable motivation; conflict resolved through hard
work, self-improvement, or trading money/favors — **never luck or a magic
solution**. Stay true to `ACTORS.md`/`PLOT.md`.

## 5. Adversarial review

Run the **`reviewer` agent with the `fiction-review` skill** to hunt
predictability, thin characters, magic solutions, weak stakes, pacing sags,
factual errors, and inconsistencies. **Apply the improvements.**

## 6. Save & wire

- Write the chapter as a prose `.md` (start with an `# H1` title) in the book.
- **Wire it into `ebook.yml` `text`** in reading order.
- Update `.story/ACTORS.md` and `.story/PLOT.md` with anything this chapter
  established (new traits, relationships, facts) and set the chapter's
  **Outcome** in `PLOT.md`.
- Report the files written/updated. (Build the book with `/ebook`'s
  `ebook-cli build` when ready.)

## Rewrites (later sessions)

On a rewrite request, load the chapter + `.story/` state, apply the requested
change, keep everything consistent, re-run the adversarial review, and update
`PLOT.md`/`ACTORS.md` if the change alters established facts.

## Prerequisites

- Web access for research and fact-checking; `ebook-cli` (from `dpurge/cli-tools`)
  to build the book.
