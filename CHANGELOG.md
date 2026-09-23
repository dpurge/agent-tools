# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `/code`'s B4 (Documentation review) and B5 (Documentation update) phases
  now also cover `CHANGELOG.md`: a missing entry for a user-facing change is
  flagged as drift in B4, and `technical-writer` adds it under
  `## [Unreleased]` in B5, in the matching Keep a Changelog category.
- Multi-artifact changelog handling: when a project declares multiple artifacts
  (e.g. npm packages or services) in `specs/tech-stack.md`'s `### Artifacts`
  table, `/code` B4 maps each affected area to its artifact's changelog(s) via
  longest-prefix matching with fan-out support, and B5 writes entries per
  artifact rather than all to one root file. A new `scripts/release-changelog.js`
  moves `## [Unreleased]` into versioned sections during release, integrated
  into the release workflow to tag with current changelog(s). `doc`'s
  new "Release wiring" check flags release workflows that tag without first
  versioning their changelog.
- Multi-artifact roadmap routing: `/code` B2 and B5 now route each feature's
  roadmap entries (`## Now`/`## Next`/`## Later`) to per-artifact roadmap files
  declared via an optional `Roadmap` column in `specs/tech-stack.md`'s
  `### Artifacts` table, using the same longest-prefix + fan-out mapping logic
  as changelogs; unspecified or empty `Roadmap` cells default to the specs-root
  roadmap.
