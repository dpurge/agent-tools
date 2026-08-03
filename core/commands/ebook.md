---
description: Add or edit a chapter in an ebook project — a generic book or a phraseforge language reader. Orients on ebook.yml, plans, gets approval, implements with web-sourced content, and test-builds with ebook-cli.
argument-hint: <what to add or change> [target file]
---

# /ebook

Work on the ebook project in the current directory (or the nearest `ebook.yml`
above it). Move through the phases in order. **Do not skip the approval gate, and
never write content from memory (see the sourcing rules).**

**Request:** $ARGUMENTS

If the request is empty, ask what to add or change.

---

## 1. Orient

- **Find the project:** the nearest `ebook.yml` in this directory or a parent. If
  there is none, ask where the project is.
- **Read `ebook.yml`** and determine:
  - **kind** — `kind: language` (a foreign-language reader that uses the phraseforge
    fences) or `kind: generic` (a normal prose book). If `kind` is absent, infer it
    from existing chapters (do they contain `{start-vocabulary}` / `{start-text}`
    fences?) and **confirm with the user**; offer to add `kind` to `ebook.yml`
    (and, for a language book, `translation-language` / `translation-script`). The
    Go `ebook-cli` ignores these extra keys.
  - **main language / script** — `language` / `script`. **Keep to these** for all
    content in the book.
  - for a language book, the **reader's language / script** — `translation-language`
    / `translation-script` (Polish by convention if unset — confirm).
- **Identify the request:** add a **new file** or edit an **existing file**. Locate
  the target file.

## 2. Plan

Propose the concrete change: which file, what content or edits, and — for any new
or generated content — the **sourcing plan** (which web sources, which grammar
reference). For a new file, say where it goes in `ebook.yml` `text`.

## 3. 🚦 Approve

Present the plan. **Stop and wait** for explicit approval before writing anything.

## 4. Implement

### Language lesson (`kind: language`)

Use `phraseforge-core` + the matching `phraseforge-lang-<iso>` + the `translator`
agent + `phraseforge-ebook`. **Quality rules — non-negotiable:**

- **Never write lesson text from memory.** If a text must be generated, **search
  the web** about the user's topic and compose it from the **exact sentences,
  phrases, and vocabulary** found in real sources. Use edits **only** to make the
  text coherent or to adapt its difficulty to the CEFR level.
- **Grammar explanations are never generated.** Find an explanation of the grammar
  point in a reputable source and **adapt** it to the book.
- **Transcription and translation go through the `translator` agent** (verified
  against dictionaries/sources), in the book's main language/script and the
  reader's translation language.
- Build vocabulary, models, and questions from the lesson text; render the
  `{start-*}` fences with `phraseforge-ebook` (`ebook-export.py`) — never a bare
  `=`, dialog body indented exactly 2 spaces.

### Generic book (`kind: generic`)

Write the chapter as prose Markdown using the `research-core` skill (web-sourced;
cite sources). For **narrative/fiction** books, use the **`/story`** command
instead — it maintains the cast/plot and runs an adversarial review. Keep the
book's `language`.

### Both

- **New file:** create it starting with an `# H1`, then **wire it into `ebook.yml`
  `text`** (the right section, in order).
- **Existing file:** apply exactly the requested edit; preserve everything else.
- Keep the book's main `language` / `script` throughout; don't drift.

## 5. Test-build

Confirm it builds with the real tool:

```bash
ebook-cli build -p ebook.yml -f mdx           # fast parse check
ebook-cli build -p ebook.yml -f epub,pdf,mdx  # EPUB + A5 PDF + Docusaurus MDX
```

Report the file(s) written/changed and the build result.

## Prerequisites

- `uv` + Python ≥ 3.11 (phraseforge tools); `ebook-cli` (from `dpurge/cli-tools`);
  `typst` + fonts for PDF; **web access** for sourcing lesson text and grammar.
