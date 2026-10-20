# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Target guard: a `tool.execute.before` hook blocks bash `kubectl` and `helm` commands that name no
  cluster (`--kubeconfig`, or `--kube-context` for helm). Set
  `AGENT_TOOLS_GUARD=off` to disable it.
- The `/code` command included in this OpenCode plugin now also checks
  `CHANGELOG.md` for drift during Documentation review (B4) and fills in
  missing entries during Documentation update (B5), filed under
  `## [Unreleased]` in the matching Keep a Changelog category.
- Multi-artifact changelog support: the `/code` command bundled in this plugin
  now correctly handles projects with multiple artifacts (packages, services,
  etc.), routing each feature's changelog entry to the right artifact file(s)
  via longest-prefix matching and build fan-out. The release workflow checker
  (`doc`'s Release wiring test) now flags release workflows that create
  tags without first versioning their changelog(s).
- Multi-artifact roadmap support: the `/code` command bundled in this plugin
  now routes each feature's roadmap entries (`## Now`/`## Next`/`## Later`) to
  per-artifact roadmap files declared in `specs/tech-stack.md`, using the same
  longest-prefix routing logic as changelogs. Projects without separate roadmap
  files see no change — one shared roadmap continues to work as before.
