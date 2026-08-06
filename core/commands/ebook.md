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

**Hard rule for URL-based lessons:** before any reasoning about the article, run this exact command first and use its output as the source text:

```bash
uv run --script $AGENT_TOOLS_ROOT/skills/phraseforge-core/tools/fetch-article.py --url '<URL>' --format markdown
```

Do **not** use `curl`, browser fetches, ad-hoc Python, or ad-hoc shell scripts for article extraction.

---

## 1. Orient

- **Find the project:** the nearest `ebook.yml` in this directory or a parent. If
  there is none, ask where the project is.
- **Read `ebook.yml`** and determine:
  - **book type from the actual chapters** — if the book's existing content uses
    phraseforge fences like `{start-vocabulary}` / `{start-text}`, treat it as a
    **language** ebook; otherwise treat it as a **generic** prose book. **Do not
    read, infer from, mention, or ask to add a `kind` key in `ebook.yml`.**
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

### Language lesson

Use `phraseforge-core` + the matching `phraseforge-lang-<iso>` + the `translator`
agent + `phraseforge-ebook`. **Quality rules — non-negotiable:**

- **Never write lesson text from memory.** If a text must be generated, **search
  the web** about the user's topic and compose it from the **exact sentences,
  phrases, and vocabulary** found in real sources. Use edits **only** to make the
  text coherent or to adapt its difficulty to the CEFR level.
- **If the source is a URL, extract the article text/title with this exact local
  command:**

  ```bash
  uv run --script $AGENT_TOOLS_ROOT/skills/phraseforge-core/tools/fetch-article.py --url '<URL>' --format markdown
  ```

  Use the returned leading `# H1` as the source title/headline. **Never write an
  ad-hoc Python/JS/shell scraper for this.**
- **Grammar explanations are never generated.** Find an explanation of the grammar
  point in a reputable source and **adapt** it to the book.
- **Transcription and translation go through the `translator` agent** (verified
  against dictionaries/sources), in the book's main language/script and the
  reader's translation language.
- Build vocabulary, models, and questions from the lesson text; in the lesson
  JSON, both vocabulary and model entries use the field name `phrase`. Render the
  `{start-*}` fences with `phraseforge-ebook` (`ebook-export.py`) — never a bare
  `=`, dialog body indented exactly 2 spaces.

### Generic book

Write the chapter as prose Markdown using the `research-core` skill (web-sourced;
cite sources). For **narrative/fiction** books, use the **`/story`** command
instead — it maintains the cast/plot and runs an adversarial review. Keep the
book's `language`.

### Both

- **New file:** create it starting with an `# H1`. For a levelled language lesson
  in the default `<level>/NNN.md` layout, the chapter H1 must stay the structural
  lesson id derived from the file path, with the level uppercased (for example
  `b1/003.md` → `# B1-003`).
  **Do not use the source article title as the chapter H1.** Instead, place the
  original source text's real title/headline at the top of the `{start-text
  as=source ...}` block as an `## H2`. Prefer the exact original headline first;
  only simplify it if the wording is clearly too difficult for the target CEFR
  level, and keep it recognisably close to the source. **After writing, verify
  both:** (1) the file H1 is the uppercased structural lesson id, and (2) the source block
  begins with the source-title `## H2`. Then **wire it into `ebook.yml` `text`**
  in the right section and order.
- **Existing file:** apply exactly the requested edit; preserve everything else.
- Keep the book's main `language` / `script` throughout; don't drift.

## 5. Test-build

Confirm it builds with the real tool, but **first check whether `ebook-cli` is actually available on PATH**:

```bash
command -v ebook-cli
```

- If that command succeeds, run:

  ```bash
  ebook-cli build -p ebook.yml -f mdx           # fast parse check
  ebook-cli build -p ebook.yml -f epub,pdf,mdx  # EPUB + A5 PDF + Docusaurus MDX
  ```

- If `ebook-cli` is **not** on PATH, report that clearly and **skip the build step**. Do not retry the same failing build command, do not fabricate an alternative builder, and do not block the rest of the task on PDF/EPUB/MDX build verification.

Report the file(s) written/changed and either the build result or that the build step was skipped because `ebook-cli` is unavailable.

## Prerequisites

- `uv` + Python ≥ 3.11 (phraseforge tools); `ebook-cli` (from `dpurge/cli-tools`);
  `typst` + fonts for PDF; **web access** for sourcing lesson text and grammar.
