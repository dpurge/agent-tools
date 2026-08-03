---
name: anki
description: Create or expand Anki flashcard decks — general-knowledge Q&A (anki-comp) or language vocabulary (anki-vocabulary) — as source files for the external deck build.
version: 1.0.0
agents:
  - researcher
  - translator
skills:
  - anki-comp
  - anki-vocabulary
  - research-core
---

# Anki Workflow

This workflow is runnable as the `/anki` slash command. The authoritative,
step-by-step instructions live in
[`core/commands/anki.md`](../commands/anki.md).

## When to use

- adding or editing cards in a deck inside the `anki-flashcards` repo (`dat/**`)
- Q&A cards for a subject (`anki-comp`) or vocabulary for a language
  (`anki-vocabulary`)

## Phases (summary)

1. **Orient** — find the target deck's `flashcard.yml` under `dat/**`; detect its
   type (`dat/comp` Q&A vs `dat/lang-vocabulary` TSV, etc.) and keep its
   conventions (model, tags, translation/transcription).
2. **Get material** — from pasted text, or gathered with the `research` skill;
   confirm uncertain translations with `translator`. Never invent.
3. **Implement** — follow the matching skill: one atomic card per record, no
   duplicates, register any new file in `flashcard.yml`, append rather than reorder.
4. **Confirm** — summarize files touched and cards added.

## Roles & skills

- `researcher` — gather accurate material; `translator` — verify translations.
- `anki-comp` — Q&A decks. `anki-vocabulary` — language vocabulary decks.

## Note

The skills produce deck **source** (card files + `flashcard.yml`). Building the
`.apkg` and the shared `_model/`/`_template/` assets live in the external
`dpurge/anki-flashcards` toolchain.

## Success criteria

- correct deck type chosen; cards match the skill's format
- material researched, not invented; no duplicates
- every card file registered in `flashcard.yml`
