# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Specs validator (in the `spec-validation` skill): new error (E3) when a `done`
  feature spec updated on or after 2026-10-24 has no CI/release decision in
  Documentation Review (`{file, needs change: yes/no, reason}` or
  `CI review: not applicable (reason)`).
- `/code` (bundled here): every new function, type, config key or route a
  specialist reports needs a non-test call site shown as `grep -n` evidence,
  re-run by the coordinator and B3's tester; the closeout checklist gains a
  matching item, and B4 step 2 now states the E3 record format.
- Specs validator (in the `spec-validation` skill): errors when a `done` feature spec is still listed in a roadmap
  `## Now` line or still has "Not started." in Implementation Notes, Validation,
  Documentation Review or Documentation Updates; warns on a missing `## Now`
  spec file and on `stalled:` open work not updated for more than 2 days. New
  `--today=YYYY-MM-DD` flag (or `VALIDATE_SPECS_TODAY`) sets the date.
- `/code` (bundled here): lists open feature specs before starting new work (B0), reviews CI,
  build and release configuration for every affected artifact and its consumers
  (B4), and requires a closeout checklist before a feature is `done` (B5).
- `/release` (bundled here): new "Release automation check" phase verifies each artifact's
  triggers, build and test commands, changelog and version stamping, tag, and
  bot-push retrigger behavior before the approval gate, and reports changelog
  history gaps.
- Target guard: a `tool_call` handler blocks bash `kubectl` and `helm` commands that name no
  cluster (`--kubeconfig`, or `--kube-context` for helm). Set
  `AGENT_TOOLS_GUARD=off` to disable it.
- The `/code` command included in this Pi extension now also checks
  `CHANGELOG.md` for drift during Documentation review (B4) and fills in
  missing entries during Documentation update (B5), filed under
  `## [Unreleased]` in the matching Keep a Changelog category.
- Multi-artifact changelog support: the `/code` command bundled in this
  extension now correctly handles projects with multiple artifacts (packages,
  services, etc.), routing each feature's changelog entry to the right artifact
  file(s) via longest-prefix matching and build fan-out. The release workflow
  checker (`doc`'s Release wiring test) now flags release workflows that
  create tags without first versioning their changelog(s).
- Multi-artifact roadmap support: the `/code` command bundled in this extension
  now routes each feature's roadmap entries (`## Now`/`## Next`/`## Later`) to
  per-artifact roadmap files declared in `specs/tech-stack.md`, using the same
  longest-prefix routing logic as changelogs. Projects without separate roadmap
  files see no change — one shared roadmap continues to work as before.
