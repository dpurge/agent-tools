#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "trafilatura>=1.12,<2",
# ]
# ///

"""Fetch an article URL and extract the main title/body.

Usage:
  uv run --script core/skills/phraseforge-core/tools/fetch-article.py \
      --url https://example.com/article --format markdown

Outputs either:
- markdown: `# <title>` followed by the extracted article body
- json: {"url","title","text","markdown"}

Exit code is non-zero if fetching or extraction fails.
"""

from __future__ import annotations

import argparse
import contextlib
import json
import socket
import sys
import urllib.request
from typing import Any

import trafilatura


def _clean(text: str | None) -> str:
    return (text or "").strip()


@contextlib.contextmanager
def _force_address_family(family: socket.AddressFamily | None):
    if family is None:
        yield
        return

    original = socket.getaddrinfo

    def filtered_getaddrinfo(host, port, family_arg=0, type_arg=0, proto=0, flags=0):
        infos = original(host, port, family_arg, type_arg, proto, flags)
        filtered = [info for info in infos if info[0] == family]
        if not filtered:
            raise socket.gaierror(f"no addresses for requested family {family.name}")
        return filtered

    socket.getaddrinfo = filtered_getaddrinfo
    try:
        yield
    finally:
        socket.getaddrinfo = original


def _fetch_html(req: urllib.request.Request, url: str) -> str:
    attempts: list[tuple[str, socket.AddressFamily | None]] = [
        ("ipv4", socket.AF_INET),
        ("auto", None),
        ("ipv6", socket.AF_INET6),
    ]
    errors: list[str] = []

    for label, family in attempts:
        try:
            with _force_address_family(family):
                with urllib.request.urlopen(req, timeout=30) as resp:  # noqa: S310
                    return resp.read().decode("utf-8", errors="replace")
        except Exception as exc:  # pragma: no cover - network failures are environment-specific
            errors.append(f"{label}: {exc}")

    raise SystemExit(f"error: failed to fetch URL: {url}\n" + "\n".join(errors))


def fetch_article(url: str) -> dict[str, Any]:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/127.0 Safari/537.36"
            )
        },
    )
    downloaded = _fetch_html(req, url)

    metadata = trafilatura.extract_metadata(downloaded)
    title = _clean(getattr(metadata, "title", None))

    body_md = trafilatura.extract(
        downloaded,
        output_format="markdown",
        include_comments=False,
        include_tables=True,
        include_links=True,
        favor_precision=True,
        deduplicate=True,
    )
    body_md = _clean(body_md)
    if not body_md:
        raise SystemExit(f"error: failed to extract article body: {url}")

    body_txt = trafilatura.extract(
        downloaded,
        output_format="txt",
        include_comments=False,
        include_tables=False,
        favor_precision=True,
        deduplicate=True,
    )
    body_txt = _clean(body_txt)

    if not title:
        first_line = next((line.strip("# ").strip() for line in body_md.splitlines() if line.strip()), "")
        title = first_line or url

    markdown = f"# {title}\n\n{body_md}\n"
    return {
        "url": url,
        "title": title,
        "text": body_txt,
        "markdown": markdown,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description="Fetch an article URL and extract its title/body.")
    ap.add_argument("--url", required=True, help="article URL")
    ap.add_argument("--format", choices=["markdown", "json"], default="markdown")
    args = ap.parse_args()

    result = fetch_article(args.url)
    if args.format == "json":
        json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
    else:
        sys.stdout.write(result["markdown"])


if __name__ == "__main__":
    main()
