---
name: research
description: Research a topic and produce a structured, fact-checked, sourced document — local RAG first, then web — as Markdown, MDX, or an A5 PDF.
version: 1.0.0
agents:
  - researcher
skills:
  - research-core
  - research-web
  - research-typst
---

# Research Workflow

This workflow is runnable as the `/research` slash command. The authoritative,
step-by-step instructions live in
[`core/commands/research.md`](../commands/research.md).

## When to use

- learning a new topic (technical or not) from a document you can read later
- summarizing a field or preparing sourced reading notes
- producing a report as Markdown, a Docusaurus MDX page, or an A5 PDF

## Phases (summary)

1. **Scope** — confirm audience and depth (Quick / Background / Deep dive).
2. **Gather** — local RAG **first** (`research-core` tools), then Wikipedia →
   arXiv → web; seek contradictory evidence; capture sources with dates.
3. **Synthesize** — the standard report shape (Title · Summary · Body · Open
   questions · References); short paragraphs, lists, tables, diagrams; every
   claim cited.
4. **Write** — `md` (default), `mdx` (`research-web`), or `pdf` (`research-typst`,
   A5).
5. **Revise** — one feedback pass; re-verify citations.

## Roles & skills

- `researcher` — read-only gathering and verification.
- `research-core` — RAG-first orchestration, sourcing, report shape.
- `research-web` — Docusaurus MDX output. `research-typst` — A5 PDF output.

## Prerequisites

- `uv` + Python ≥ 3.11 (RAG and search tools); `typst` (PDF only).

## Success criteria

- local knowledge checked before the web; every claim sourced
- contradictions surfaced in Open questions
- document written in the requested format and reviewed once
