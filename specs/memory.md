# Project Memory

<!-- Append-only, one entry per line: `YYYY-MM-DDTHH:MM:SSZ [tag] text`. See the `memory-format` skill. Do not read this file in full — grep it. -->

2026-09-16T16:18:14Z [gotcha] validate-specs.js's YAML parser coerces an unquoted `updated: YYYY-MM-DD` value into a Date object, not a string — checks must accept both.
2026-09-16T16:18:15Z [convention] Only technical-writer and engineer write specs-root files; other roles are read-only by tool grant and report candidates instead.
2026-09-16T16:18:16Z [build] npm test runs three steps in sequence: validate, then test:scripts (node --test scripts/*.test.js), then test:packages (each package's own tests).
2026-09-23T11:25:53Z [convention] Optional ### subsections can be added in existing ## sections of constitution files without breaking validate-specs checkSections—regex matches ## only, not ###.
2026-09-23T11:25:54Z [gotcha] Repo has no Prettier config and does not enforce Prettier in CI or npm test. Files under scripts/ may fail prettier --check; not meaningful as regression signal.
2026-09-23T12:21:56Z [convention] specs: true root 1 dir up from `specs/`, 2 up from `.agent/specs/` — detected via `path.basename(path.dirname(specsDir)) === ".agent"`
