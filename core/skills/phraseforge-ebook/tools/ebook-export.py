# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "pydantic>=2.6",
#   "pyyaml>=6.0",
# ]
# ///
"""Render a PhraseForge Lesson JSON as a {start-*}-fenced Markdown chapter for
the cli-tools `ebook` builder (Route B), and optionally scaffold an ebook.yml.

The chapter is consumed by `ebook-cli build` to produce EPUB / A5 PDF / Docusaurus
MDX. This tool emits ONLY the fence grammar that Go tool understands; it never
emits an exercise block (the ebook format has none).

Usage:
    uv run --script ebook-export.py --in lesson.json --out chapter.md
    uv run --script ebook-export.py < lesson.json > chapter.md
    # also scaffold a starter project file next to the chapter:
    uv run --script ebook-export.py --in lesson.json --out ch01.md \\
        --ebook-yml ebook.yml --book-name my-notes --section section.md

Fence rules honoured (from the cli-tools parser contract):
  - vocabulary: `headword {grammar} [transcription] = translation (notes)`,
    never a bare `=`; `as=` is illegal here.
  - models / questions: split on the FIRST ` = ` (spaces around it).
  - dialog: `--:` / `@Name:` headers; body indented EXACTLY 2 spaces.
  - text: raw markdown, `as=` in {source,transcription,translation,grammar}.
  - every chapter starts with an `# H1`.
"""

from __future__ import annotations

import argparse
import sys
import uuid
from pathlib import Path

import yaml
from pydantic import ValidationError

_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

from lesson_schema import DialogSource, DialogTurn, Lesson, Narration, TextSource  # noqa: E402


def _attrs(lang: str | None, script: str | None, *, as_: str | None = None) -> str:
    parts = []
    if as_:
        parts.append(f"as={as_}")
    if lang:
        parts.append(f"lang={lang}")
    if script:
        parts.append(f"script={script}")
    return (" " + " ".join(parts)) if parts else ""


def _with_notes(translation: str, notes: str | None) -> str:
    translation = translation.strip()
    if notes and notes.strip():
        return f"{translation} ({notes.strip()})"
    return translation


def _vocab_line(entry) -> str | None:
    headword = (entry.headword or "").strip()
    if not headword:
        return None
    parts = [headword]
    if entry.grammar and entry.grammar.strip():
        parts.append("{" + entry.grammar.strip() + "}")
    if entry.transcription and entry.transcription.strip():
        parts.append("[" + entry.transcription.strip() + "]")
    line = " ".join(parts)
    # Only add ` = translation` when there IS a translation — never a bare `=`.
    if entry.translation and entry.translation.strip():
        # The vocabulary parser splits on the RIGHTMOST `=`, so a raw `=` inside
        # the translation/notes would corrupt the fields (and panic the CSV path).
        # Swap it for a full-width `=` (U+FF1D) — visually similar, but inert.
        trans = _with_notes(entry.translation, entry.notes).replace("=", "＝")
        line += " = " + trans
    return line


def _model_line(entry) -> str | None:
    pattern = (entry.pattern or "").strip()
    translation = (entry.translation or "").strip()
    if not pattern or not translation:
        return None
    left = pattern
    if entry.transcription and entry.transcription.strip():
        left += " [" + entry.transcription.strip() + "]"
    return f"{left} = " + _with_notes(translation, entry.notes)


def _fence(name: str, attr: str, body: list[str]) -> list[str]:
    return [f"{{start-{name}{attr}}}", "", *body, "", f"{{end-{name}}}", ""]


def _indent(text: str) -> list[str]:
    """Indent EVERY line of a (possibly multi-line) paragraph by exactly 2 spaces.

    The dialog parser hard-errors on any body line not indented exactly 2 spaces,
    so an embedded newline must be indented too — not just the first line.
    """
    return ["  " + line for line in text.strip().split("\n")]


def _dialog_body(dialog: DialogSource) -> list[str]:
    """Render a dialog: `--:` / `@Name:` headers, body indented exactly 2 spaces."""
    lines: list[str] = []
    for item in dialog.items:
        if isinstance(item, DialogTurn):
            # Strip a trailing colon so a speaker doesn't render as `Name::`.
            speaker = item.speaker.strip().rstrip(":").strip() if item.speaker else None
            lines.append(f"@{speaker}:" if speaker else "--:")
            for i, para in enumerate(item.paragraphs):
                if i:
                    lines.append("")  # blank line separates paragraphs within a turn
                lines += _indent(para)
            lines.append("")
        elif isinstance(item, Narration):
            # No narration concept in the ebook dialog format; render as an
            # anonymous turn so the block stays parseable.
            lines.append("--:")
            lines += _indent(item.text)
            lines.append("")
    while lines and lines[-1] == "":
        lines.pop()
    return lines


def render(lesson: Lesson) -> str:
    lang, script = lesson.lang, lesson.script
    tl = lesson.translation_lang or "pol"
    ts = lesson.translation_script or "latn"

    out: list[str] = [f"# {lesson.title.strip()}", ""]

    if lesson.vocabulary:
        body = [line for e in lesson.vocabulary if (line := _vocab_line(e))]
        if body:
            out += _fence("vocabulary", _attrs(lang, script), body)

    if lesson.models:
        body = [line for m in lesson.models if (line := _model_line(m))]
        if body:
            out += _fence("models", _attrs(lang, script), body)

    if isinstance(lesson.source, TextSource) and lesson.source.content.strip():
        out += _fence("text", _attrs(lang, script, as_="source"), [lesson.source.content.strip()])
    elif isinstance(lesson.source, DialogSource):
        out += _fence("dialog", _attrs(lang, script), _dialog_body(lesson.source))

    if lesson.transcription and lesson.transcription.strip():
        out += _fence("text", _attrs(lang, "latn", as_="transcription"), [lesson.transcription.strip()])

    if lesson.translation and lesson.translation.strip():
        out += _fence("text", _attrs(tl, ts, as_="translation"), [lesson.translation.strip()])
    elif lesson.translation_dialog:
        out += _fence("dialog", _attrs(tl, ts, as_="translation"), _dialog_body(lesson.translation_dialog))

    if lesson.questions:
        body = [q.strip() for q in lesson.questions if q.strip()]
        if body:
            out += _fence("questions", _attrs(lang, script), body)

    if lesson.grammar and lesson.grammar.strip():
        out += _fence("text", _attrs(tl, "latn", as_="grammar"), [lesson.grammar.strip()])

    return "\n".join(out).rstrip() + "\n"


def scaffold_ebook_yml(path: Path, lesson: Lesson, book_name: str, chapter: str, section: str) -> None:
    if path.exists():
        sys.stderr.write(f"{path} already exists — add '{chapter}' to its `text` list manually\n")
        return
    project = {
        "identifier": str(uuid.uuid4()),
        "filename": f"{book_name}.epub",
        "title": lesson.title,
        "author": lesson.author or "",
        "language": lesson.lang,
        "script": lesson.script,
        "cover": "cover.svg",
        "description": lesson.description or "",
        "stylesheet": {"common": ["css/font.css", "css/base.css"]},
        "font": [],
        "image": [],
        "text": [[section, chapter]],
    }
    path.write_text(yaml.safe_dump(project, allow_unicode=True, sort_keys=False), encoding="utf-8")
    sys.stderr.write(f"scaffolded {path} (edit cover/stylesheet paths to match your project)\n")


def main() -> int:
    ap = argparse.ArgumentParser(description="Render a Lesson JSON as a fenced ebook chapter.")
    ap.add_argument("--in", dest="infile", type=Path, default=None, help="Lesson JSON (default: stdin)")
    ap.add_argument("--out", dest="outfile", type=Path, default=None, help="chapter .md (default: stdout)")
    ap.add_argument("--ebook-yml", type=Path, default=None, help="scaffold a starter ebook.yml here")
    ap.add_argument("--book-name", default="lessons", help="basename for <name>.epub in a scaffolded project")
    ap.add_argument("--section", default="section.md", help="section file for a scaffolded project")
    args = ap.parse_args()

    try:
        raw = args.infile.read_text(encoding="utf-8") if args.infile else sys.stdin.read()
    except FileNotFoundError:
        sys.stderr.write(f"error: input file not found: {args.infile}\n")
        return 1
    except OSError as error:
        sys.stderr.write(f"error: cannot read input file '{args.infile}': {error}\n")
        return 1

    try:
        lesson = Lesson.model_validate_json(raw)
    except ValidationError as error:
        sys.stderr.write(
            "error: invalid lesson JSON (see phraseforge-core/tools/ff-parser.py --print-schema):\n"
            f"{error}\n"
        )
        return 1

    chapter_md = render(lesson)

    if args.outfile:
        args.outfile.parent.mkdir(parents=True, exist_ok=True)
        args.outfile.write_text(chapter_md, encoding="utf-8")
    else:
        sys.stdout.write(chapter_md)

    if args.ebook_yml:
        if not args.outfile:
            sys.stderr.write(
                "warning: --ebook-yml without --out; 'chapter.md' in the project won't exist on disk\n"
            )
        chapter_name = args.outfile.name if args.outfile else "chapter.md"
        scaffold_ebook_yml(args.ebook_yml, lesson, args.book_name, chapter_name, args.section)

    return 0


if __name__ == "__main__":
    sys.exit(main())
