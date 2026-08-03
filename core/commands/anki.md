---
description: Add or edit Anki flashcards in an anki-flashcards deck — orient on the target deck, keep its format, and source material from pasted text or research (never invented).
argument-hint: <deck path or name> <what to add or edit>
---

# /anki

Work on a flashcard deck in the anki-flashcards repo. Decks live under `dat/**`,
each a `flashcard.yml` manifest plus card files, with shared `_model/`/`_template/`
assets per family.

**Request:** $ARGUMENTS

If no deck is given, ask which deck (or directory) to work in.

---

## 1. Orient

- **Find the target deck's `flashcard.yml`** from the path/name in the request (or
  ask). Read it: deck name, model/templates, and the existing `data` files.
- **Detect the deck type** from its family and model, and keep to its conventions:
  - `dat/comp/**` → general-knowledge **Q&A** — use the **`anki-comp`** skill
    (`Q`/`A` + optional `C`/`N` records, one `*.yml` per subtopic).
  - `dat/lang-vocabulary/**` → language **vocabulary** — use the **`anki-vocabulary`**
    skill (tab-separated `Phrase`/`Grammar`/`Transcription`/`Translation`/`Notes`,
    one `*.csv` per source).
  - other families → follow the model the deck's existing files already use.
- Note the translation language / transcription script the deck uses, and the tag
  scheme. **Match what the deck already does** — don't introduce a new convention.

## 2. Get the material

- If the user **pasted** text or a word/phrase list → derive the cards from it.
- Otherwise gather the material with the **`research-core` skill** (web-sourced; cite).
- **Never invent facts, translations, or grammar.** For language vocabulary,
  confirm uncertain translations/transcriptions with the `translator` agent.

## 3. Implement

Follow the matching skill (`anki-comp` or `anki-vocabulary`):

- Choose the right subtopic/source file; read it first to avoid duplicates and to
  match its coverage/structure.
- One clear, atomic card per record; append rather than reorder existing cards.
- **New file** → create it and add its `data` entry (with `tags`) to `flashcard.yml`
  in the **same** edit — an unreferenced file is invisible to the deck.
- **Existing file** → apply exactly the requested change (add/fix/split cards).

## 4. Confirm

Summarize the files touched and the cards added or changed. Building the `.apkg` is
the repo's own step (`task build`).
