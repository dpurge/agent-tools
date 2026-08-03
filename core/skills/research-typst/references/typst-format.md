# Research → Typst (A5 PDF) format

`tools/typst-export.py` renders a **report JSON** into a Typst `.typ` file laid out
for a comfortable A5 read on an e-reader, then (optionally) compiles it to PDF.

All text is inserted as Typst string literals, so you never have to escape markup —
write plain text and it renders verbatim.

## Commands

```bash
# JSON -> .typ  (--in/--out, or stdin/stdout: `... < report.json > report.typ`)
uv run --script tools/typst-export.py --in report.json --out report.typ

# JSON -> .typ -> PDF (needs the `typst` binary on PATH)
uv run --script tools/typst-export.py --in report.json --out report.typ --compile

# or compile yourself
typst compile report.typ report.pdf
```

## Report JSON schema

```jsonc
{
  "title": "string (required)",
  "subtitle": "string (optional)",
  "date": "string (optional, e.g. 2026-08-03)",
  "summary": "string (required) — the ~60–100 word summary",
  "sections": [
    {
      "heading": "string (required)",
      "level": 2,                 // 2 (==) or 3 (===); default 2
      "blocks": [ /* see block types */ ]
    }
  ],
  "open_questions": ["string", "..."],   // optional; contradictions / gaps
  "references": [
    { "key": "Bloom1970", "text": "Full citation text.", "url": "https://..." }
  ]
}
```

### Block types (the `blocks` array)

Each block is an object with a `type`:

| `type` | Fields | Renders as |
| --- | --- | --- |
| `paragraph` | `text` | a justified paragraph |
| `bullets` | `items: [string]` | a bullet list |
| `numbered` | `items: [string]` | a numbered list |
| `table` | `headers: [string]`, `rows: [[string]]` | a bordered table with a shaded header row |
| `quote` | `text`, `attribution?` | a block quote |
| `code` | `text`, `lang?` | a monospaced code block |
| `image` | `path`, `caption?` | a full-width figure (path relative to the `.typ`) |

## Page style

- Paper **A5** (148 × 210 mm), margins `x: 1.4cm, y: 1.6cm`, page numbers.
- Body 11 pt, justified, comfortable leading — tuned for e-reader legibility.
- Uses only Typst-bundled fonts, so it compiles anywhere `typst` is installed.

## Diagrams

Typst has no native Mermaid support. For the PDF, use the `table`/`bullets`
blocks, or pre-render a diagram to an image and reference it with an `image`
block. Mermaid code fences belong in the Markdown/MDX outputs, not here.
