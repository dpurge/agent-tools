---
name: research-typst
description: Render a research report (produced by research-core) as an A5 PDF via Typst — a printable, e-reader-friendly document. Use when the user mentions Typst, PDF, a printable report, or wants a research write-up as PDF.
user-invocable: true
---

# Research → A5 PDF (Typst)

Render a research report (from `research-core`) as a `.typ` file and compile it to
an **A5 PDF** comfortable to read on an e-reader. Requires the `typst` binary and
`uv` on PATH.

## When invoked

1. Get the report content from `research-core` (topic → sourced, structured report).
2. Confirm the **output path** for the `.pdf` (and thus the `.typ` beside it).
3. Build the **report JSON** (schema in `references/typst-format.md`): `title`,
   optional `subtitle`/`date`, `summary`, `sections[]` of typed `blocks`
   (paragraph / bullets / numbered / table / quote / code / image),
   `open_questions[]`, and `references[]` (each `key` + `text` + optional `url`).
   Keep paragraphs short; use `bullets`/`numbered` for enumerations and `table`
   for comparisons.
4. Render and compile:

   ```bash
   uv run --script tools/typst-export.py --in report.json --out report.typ --compile
   ```

   (Drop `--compile` to produce only the `.typ`, then `typst compile report.typ`.)
5. Confirm with a one-line message naming the PDF written.

## Constraints

- Every claim keeps its inline citation `[Key]`; the `references` list resolves
  each key with a URL or DOI/ISBN (and retrieval date for web sources).
- Do not invent content — render only what `research-core` produced.
- **Diagrams:** Typst has no Mermaid. Use tables/lists, or embed a pre-rendered
  image via an `image` block. Mermaid diagrams belong in the Markdown/MDX outputs.

## Prerequisites

- `uv` (runs the PEP 723 tool; resolves `pydantic` on first run).
- `typst` (compiles the `.typ` to PDF).

## References

- `references/typst-format.md` — the report JSON schema, block types, page style,
  and compile commands.
