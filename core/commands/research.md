---
description: Research a topic (technical or not) and produce a well-structured, fact-checked, sourced document to read at your leisure — Markdown (default), MDX, or A5 PDF.
argument-hint: <topic> [--format md|mdx|pdf] [--out path]
---

# Research

Research the topic below and write a clear, sourced document a reader can learn
from. **Never rely on training memory alone** — every non-trivial claim must be
backed by a source you actually consulted this run. Use the `research-core`,
`research-web`, and `research-typst` skills.

**Topic (and options):** $ARGUMENTS

If no topic is given, ask what to research. Parse an optional `--format`
(`md` default · `mdx` · `pdf`) and `--out` path from the arguments.

---

## 1. Scope

Confirm audience, depth, and any angle once (don't over-ask). Depth tiers:
**Quick** ~500–1000 words (default) · **Background** ~1500–3000 · **Deep dive**
3000+. If the user didn't ask for long, default to Quick.

## 2. Gather evidence — local first, then the web

Use the `research-core` skill's tools (via `uv run --script`), local knowledge
base **first**; only fall through when it has nothing relevant:

1. **RAG (local, takes precedence):** `tools/rag-query.py "<query>"`. Non-empty
   JSON → those chunks are primary input (cite `[local:<file>]`). Empty `[]` →
   step 2. (No `uv`? Skip RAG and use the host's web tools.)
2. **Wikipedia** → **arXiv** → **web search** (`tools/wikipedia-search.py`,
   `arxiv-search.py`, `web-search.py`, or the host's native web search), in that
   order, until you have enough.

For each source: prefer primary/authoritative over first-found; capture a URL or
DOI/ISBN; note publication and retrieval dates (content rots). Actively look for
**contradictory or alternative evidence**, not just confirming sources.

## 3. Synthesize the standard-format report

Follow `research-core/references/report-shape.md`:

- **Title** · **Summary** (~60–100 words) · **Body** (one H2 per sub-topic) ·
  **Open questions** (things sources disagreed on or didn't cover) · **References**
  (every entry has a URL or DOI/ISBN; web entries include a retrieval date).
- **Readable:** short paragraphs; use **lists** for enumerations, **tables** for
  comparisons, and **diagrams** (Mermaid) where they clarify — for MD/MDX.
- Every claim carries an inline citation `[Key]` resolved in References.
  "I do not know based on the current evidence" is an acceptable answer.

## 4. Write the document in the requested format

- **`md` (default):** write the report as clean Markdown — H1 title, summary, H2
  sections, Open questions, References. Mermaid fences allowed.
- **`mdx`:** use the **`research-web`** skill (stock Docusaurus MDX: frontmatter
  `title`/`description`/`tags`, H2/H3 body, one citation style, References).
- **`pdf`:** use the **`research-typst`** skill — build the report JSON
  (`research-typst/references/typst-format.md`) and run
  `uv run --script tools/typst-export.py --in report.json --out <out>.typ --compile`
  for an **A5** PDF. Diagrams: use tables/lists or a pre-rendered image (no Mermaid
  in PDF).

Confirm the output path before writing; don't overwrite without asking.

## 5. Offer one revision

Summarize what you wrote and invite corrections. On feedback, revise per
`research-core/references/revision.md` (track accepted/rejected claims; re-verify
cited URLs still support the claim).

## Prerequisites

- `uv` + Python ≥ 3.11 — for the RAG and search tools (first run downloads a small
  embedding model for RAG).
- `typst` — only for `--format pdf`.
