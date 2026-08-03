---
name: phraseforge-ebook
description: Render a PhraseForge lesson (from phraseforge-core) as a {start-*}-fenced Markdown chapter + ebook.yml for the cli-tools ebook builder, which produces EPUB, an A5 PDF, and Docusaurus MDX. Use when the user wants a phraseforge lesson built into an ebook / epub-public book / A5 PDF.
user-invocable: true
---

# PhraseForge → ebook (Route B)

Render a PhraseForge lesson as the input the `cli-tools` **`ebook`** builder
consumes: a `{start-*}`-fenced chapter `.md` plus an `ebook.yml` project. The
builder then produces **EPUB**, an **A5 PDF** (comfortable on an e-reader), and
**Docusaurus MDX** — one input, three outputs.

## When invoked

1. Get the conceptual lesson from `phraseforge-core` (+ the matching
   `phraseforge-lang-<iso>`): vocabulary, models, source text or dialog,
   transcription, translation, questions. (No exercises — the ebook format has no
   exercise block.)
2. **Build the Lesson JSON** (schema: `phraseforge-core/tools/ff-parser.py --print-schema`).
   Or parse an existing `*.ff` source with `ff-parser.py`.
3. **Decide the target:** a chapter in an existing epub-public book, or a new book.
   - Existing book: pick the chapter filename per its convention and add it to the
     `ebook.yml` `text` list.
   - New book: scaffold with `--ebook-yml` (see below), then point its `cover` and
     `stylesheet` paths at real assets.
4. **Render the chapter** (and optionally scaffold the project):

   ```bash
   uv run --script tools/ebook-export.py --in lesson.json --out <chapter>.md
   # new book:
   uv run --script tools/ebook-export.py --in lesson.json --out 01.md \
       --ebook-yml ebook.yml --book-name <name> --section section.md
   ```
5. **Verify it builds** (if `ebook-cli` is available):

   ```bash
   ebook-cli build -p ebook.yml -f mdx        # fast parse check, no fonts needed
   ebook-cli build -p ebook.yml -f epub,pdf,mdx
   ```
6. Confirm with a one-line message naming the file(s) written and their `ls -lh`
   size. **Write to disk — never print the chapter to chat instead of saving.**

## Constraints

- Emit only the fence grammar in `references/ebook-format.md`. Honor its rules
  (never a bare `=` in vocabulary; dialog body indented exactly 2 spaces; every
  file starts with `# H1`; `filename` ends `.epub`; raw ISO codes).
- The exporter enforces these, so prefer building the Lesson JSON and letting
  `ebook-export.py` render, rather than hand-writing fences.

## Prerequisites

- `uv` + Python ≥ 3.11 (runs the exporter; resolves `pydantic`/`pyyaml`).
- `ebook-cli` (built from `dpurge/cli-tools`, Go) — to build EPUB/PDF/MDX.
- `typst` and the book's fonts — for the PDF output only.

## References

- `references/ebook-format.md` — the fence-block catalog, `ebook.yml` schema,
  build commands, and parser rules/gotchas.
