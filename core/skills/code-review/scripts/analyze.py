#!/usr/bin/env python3
"""Lightweight review aid for the code-review skill.

Scans a file or directory and reports simple, objective signals a reviewer
should look at: oversized files, long lines, and leftover review markers
(TODO / FIXME / XXX / HACK). Standard library only.

Usage:
    python3 analyze.py [PATH ...] [--max-lines N] [--max-line-length N]

Exits 0 always; findings are advisory, not gating.
"""

import argparse
import os
import sys

MARKERS = ("TODO", "FIXME", "XXX", "HACK")

IGNORED_DIRS = {".git", "node_modules", ".venv", "dist", "build", "coverage", "__pycache__"}

TEXT_EXTENSIONS = {
    ".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs",
    ".py", ".go", ".java", ".rb", ".php", ".rs", ".cs",
    ".c", ".cpp", ".h", ".hpp", ".sh", ".md", ".json", ".yaml", ".yml",
}


def iter_files(paths):
    for path in paths:
        if os.path.isfile(path):
            yield path
            continue
        for root, dirs, files in os.walk(path):
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
            for name in files:
                if os.path.splitext(name)[1] in TEXT_EXTENSIONS:
                    yield os.path.join(root, name)


def analyze_file(path, max_lines, max_line_length):
    findings = []
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as handle:
            lines = handle.readlines()
    except OSError as error:
        return [f"{path}: could not read ({error})"]

    if len(lines) > max_lines:
        findings.append(f"{path}: large file ({len(lines)} lines > {max_lines})")

    for number, line in enumerate(lines, start=1):
        stripped = line.rstrip("\n")
        if len(stripped) > max_line_length:
            findings.append(f"{path}:{number}: long line ({len(stripped)} chars)")
        for marker in MARKERS:
            if marker in stripped:
                findings.append(f"{path}:{number}: {marker} marker")
                break
    return findings


def main(argv=None):
    parser = argparse.ArgumentParser(description="Code review analysis helper.")
    parser.add_argument("paths", nargs="*", default=["."], help="Files or directories to scan.")
    parser.add_argument("--max-lines", type=int, default=400)
    parser.add_argument("--max-line-length", type=int, default=120)
    args = parser.parse_args(argv)

    paths = args.paths or ["."]
    findings = []
    for path in iter_files(paths):
        findings.extend(analyze_file(path, args.max_lines, args.max_line_length))

    if findings:
        print(f"{len(findings)} signal(s) for review:")
        for finding in findings:
            print(f"  - {finding}")
    else:
        print("No review signals found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
