---
name: ebook
description: Add or edit a chapter in an ebook project — a generic prose book or a phraseforge language reader — orienting on ebook.yml, planning, getting approval, implementing with web-sourced content, and test-building with ebook-cli.
version: 1.0.0
agents:
  - researcher
  - translator
  - engineer
skills:
  - phraseforge-core
  - phraseforge-ebook
  - research-core
---

# Ebook Workflow

This workflow is runnable as the `/ebook` slash command. The authoritative,
step-by-step instructions live in
[`core/commands/ebook.md`](../commands/ebook.md).

## When to use

- adding a chapter to, or editing, an `ebook.yml` project built by `cli-tools`
- a **generic** book (prose on any topic) or a **language** reader (phraseforge
  fences: vocabulary, models, text, dialog, questions, transcription, translation)

## Phases (summary)

1. **Orient** — find the nearest `ebook.yml`; determine book type from the actual
   chapters (phraseforge-fenced language ebook vs generic prose book), read
   `language`/`script`, and (for language books) `translation-language`/`-script`;
   identify a new-file vs edit-existing request. Do not rely on a `kind` key.
2. **Plan** — the concrete change + a **sourcing plan**.
3. **Approval gate** — the human approves before anything is written.
4. **Implement**
   - **language**: `phraseforge-core` + `phraseforge-lang-<iso>`
     + `translator` + `phraseforge-ebook`. The lesson JSON uses `phrase` for both
     vocabulary and model entries. **Text is web-sourced (never from
     memory); grammar explanations are found and adapted, never generated;**
     translation/transcription go through `translator`.
   - **generic**: prose chapters via `research-core`; for
     narrative/fiction books use the `/story` command (fiction-writing +
     fiction-review + `.story/` state).
   - New files are wired into `ebook.yml`; the main language/script is preserved.
5. **Test-build** — first check `command -v ebook-cli`; if present, run `ebook-cli build` (mdx, then epub/pdf/mdx). If absent, report the missing tool once and skip build verification; do not retry the same failing command or invent a substitute builder.

## Roles & skills

- `researcher` — web-sourced material and grammar references.
- `translator` — verified translation and transcription.
- `phraseforge-core` / `phraseforge-lang-*` / `phraseforge-ebook` — language-lesson
  authoring and the ebook-fence renderer. `research-core` — generic prose chapters.

## Prerequisites

- `uv` + Python ≥ 3.11; `ebook-cli` (from `dpurge/cli-tools`); `typst` + fonts for
  PDF; web access.

## Success criteria

- correct book type handled from chapter structure, without relying on `kind`; main language/script kept
- lesson text and grammar sourced from the web, not invented
- new files wired into `ebook.yml`; language-lesson chapter titles preserve the original source title when available; the project builds
