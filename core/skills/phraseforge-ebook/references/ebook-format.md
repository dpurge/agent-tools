# PhraseForge → ebook (Route B) format

`tools/ebook-export.py` renders a **Lesson JSON** into a `{start-*}`-fenced chapter
`.md` that the `cli-tools` **`ebook`** builder parses into EPUB / **A5 PDF** /
Docusaurus MDX. This is the exact input contract of that Go tool — respect it or
the build fails.

## Commands

```bash
# Lesson JSON -> fenced chapter .md
uv run --script tools/ebook-export.py --in lesson.json --out 01.md

# also scaffold a starter ebook.yml (fresh UUID) next to it
uv run --script tools/ebook-export.py --in lesson.json --out 01.md \
    --ebook-yml ebook.yml --book-name my-notes --section section.md

# build (from the project dir; needs the ebook-cli binary from cli-tools)
ebook-cli build -p ebook.yml -f epub,pdf,mdx
```

## Fence blocks the exporter emits

Each marker sits on its own line; a matching `{end-NAME}` always follows.

| Block | Marker | Line grammar / body |
| --- | --- | --- |
| vocabulary | `{start-vocabulary lang= script=}` | `phrase {grammar} [transcription] = translation (notes)` — **never a bare `=`**; `as=` is illegal |
| models | `{start-models lang= script=}` | `phrase [transcription] = translation` — split on the **first** ` = ` |
| text | `{start-text as= lang= script=}` | raw markdown; `as` ∈ `source` / `transcription` / `translation` / `grammar` |
| dialog | `{start-dialog [as=translation] lang= script=}` | `@Name:` / `--:` header lines; body indented **exactly 2 spaces**; blank line separates paragraphs |
| questions | `{start-questions lang= script=}` | one question per line (question-only) |
| parallel | `{start-parallel lang= script=}` | records separated by a lone `===` line; each record is 1-3 fields separated by a lone `---` line: **source** (uses `lang=`/`script=`) → **translation** (book language, no marker) → **transcription** (optional, always Latin script/LTR) |

**No exercise block exists** — exercises are not part of the ebook format.

## `ebook.yml` project

```yaml
identifier: <uuid>              # required for EPUB
filename: my-notes.epub         # REQUIRED, must end .epub (all outputs derive from it)
title: <book title>
author: <author>
language: deu                   # RAW ISO 639-3 (not de)
script: latn                    # lowercase ISO 15924
cover: cover.svg                # must exist
description: <text>
stylesheet:
  common: [css/font.css, css/base.css]   # font.css defines @font-face roles; files must exist
font: []
image: []
text:                           # outer list = sections; first item = section file, rest = chapters
- - section.md
  - 01.md
  - 02.md
```

Every `.md` (section + chapters) must start with an `# H1`. All referenced paths
(cover, stylesheet, fonts) must exist relative to `ebook.yml`.

## Rules & gotchas (from the parser)

- **`=` split direction differs:** vocabulary uses the **rightmost** `=`; models
  and questions use the **first** ` = ` (spaces). The exporter handles this.
- **Notes stay in the translation** in the built output (e.g. `= brzeg (rzeki)`);
  they are only split out by `ebook-cli vocab` → CSV.
- **Dialog body must be exactly 2 spaces** indented — any other indent is a hard
  build error.
- **Parallel splits on EVERY lone `---`**, not just the last one (unlike the old
  behavior some docs elsewhere may still describe) — up to 3 fields. The
  transcription field is always rendered in Latin script, left-to-right,
  regardless of the source's own script (matches vocabulary/models' existing
  transcription convention). `lang=`/`script=` are optional; omitted, the
  source falls back to the book's own language/script.
- **Raw ISO codes.** MDX keeps `deu`/`latn` verbatim; EPUB/PDF map them, and an
  unknown `language` silently falls back to English in EPUB/PDF.
- **A5** is the PDF default (`book.typ`); override via `~/.config/cli-tools/config.yml`
  (`Pdf.paper`, `Pdf.margin.*`, `Pdf.font`).
