# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Specs validator: new error (E3) when a `done` feature spec updated on or after
  2026-10-24 has no CI/release decision in Documentation Review (a
  `{file, needs change: yes/no, reason}` record or a `CI review: not applicable
  (reason)` line); older specs are not affected.
- Claude Code `Stop` hook (`closeout-guard.mjs`, installed with the target guard;
  `--no-hooks` skips both): when the working tree changes `specs/`, it runs the
  validator and blocks the session from ending only for the closeout errors (a
  closed feature still in `## Now`, a `done` spec with "Not started." sections or
  no CI/release decision). It cannot loop: at most 2 blocks per session, never
  the same message twice, at most 1200 characters of feedback (5 error lines),
  a 10 s validator limit inside a 20 s hook timeout, and it fails open on any
  error. `AGENT_TOOLS_CLOSEOUT=off` disables it.
- `/code`: every new function, type, config key or route a specialist reports
  needs a non-test call site shown as `grep -n` evidence, which the coordinator
  and B3's tester re-run; the closeout checklist gains a matching item.
- Specs validator: errors when a `done` feature spec is still listed in a roadmap
  `## Now` line or still has "Not started." in Implementation Notes, Validation,
  Documentation Review or Documentation Updates; warns on a missing `## Now`
  spec file and on `stalled:` open work not updated for more than 2 days. New
  `--today=YYYY-MM-DD` flag (or `VALIDATE_SPECS_TODAY`) sets the date.
- `/code`: lists open feature specs before starting new work (B0), reviews CI,
  build and release configuration for every affected artifact and its consumers
  (B4), and requires a closeout checklist before a feature is `done` (B5).
- `/release`: new "Release automation check" phase verifies each artifact's
  triggers, build and test commands, changelog and version stamping, tag, and
  bot-push retrigger behavior before the approval gate, and reports changelog
  history gaps.
- `operations` rule and `safe-operations` skill: name the target explicitly on
  every `kubectl`, `helm`, `gcloud`, `aws`, `docker` and database command
  (never rely on `KUBECONFIG`, the current context or a default profile), run a
  pre-flight check, start read-only, bound long commands, keep secrets out of
  output, verify deploys by digest, and clean up.
- `api-verification` skill and `api-use` rule: confirm a library, framework or
  CLI API against the installed package (repository uses, then `go doc`,
  `inspect`, `.d.ts` files, `javap`, `cargo doc`, then a compile of a small use)
  and label anything unconfirmed, instead of relying on memory or a documentation
  service. Loaded by `engineer`, `tester`, `architect` and `reviewer`.
- `spec-validation` skill: the specs validator now ships inside the toolkit as one
  self-contained file (`validate-specs.mjs`, bundled with esbuild by
  `npm run build:validator`) that runs with plain Node.js in any project on any
  host. Models used to be told to run `node scripts/validate-specs.js` (a path
  that exists only inside this repository) or `agent-tools validate-specs`
  (needs the CLI on the `PATH`), and reported the validator as unavailable.
  `/code`, its workflow and the format skills now point at the skill.
- `ui-verification` skill: check a changed page in a real browser with
  Playwright (screenshots at the supported widths, measured overflow, RTL and
  CJK content, console errors), using a scratch script rather than an MCP
  server. Loaded by `engineer` and `tester`.
- `testing-playbook` skill: baselines, narrowest-first runs, counting skips
  (a skip is unverified, not passed), fail-before/pass-after proof, fakes and
  injected clocks, real-artifact smoke runs, budgeted real calls, and
  independent verification of delegated work.
- Target guard for all three hosts: denies `kubectl` and `helm` commands that
  name no cluster (no `--kubeconfig`, or `--kube-context` for helm). The detection
  is one shared module (`adapters/shared/target-guard.mjs`); `npm run sync:guard`
  copies it next to each host adapter and a test fails when a copy has drifted.
  - Claude Code: a `PreToolUse` Bash hook, registered by every Claude installer
    (editable installs point at the checkout; `install:claude` copies it to
    `.claude/hooks/`). Opt out with `--no-hooks`.
  - OpenCode: a `tool.execute.before` hook in the plugin. Pi: a `tool_call`
    handler in the extension. Both are part of the plugin, so `--no-hooks` does
    not apply and the installers say so.
  - All hosts: `AGENT_TOOLS_GUARD=off` disables it. It only sees direct
    commands, not `bash -c`, scripts or aliases.
- `/code` ground rules "Targets and environments" and "Briefs and verification";
  the tech-stack step now records dev targets and naming conventions, and the
  test and documentation steps require skip counts, a real-artifact run, and
  commands that were executed rather than proposed.
- `coordinator` "Delegating" (brief checklist) and "Verifying" sections,
  mandatory "Not reviewed" list for `reviewer`, and an "Execution discipline"
  section for `technical-writer`.

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

### Removed

- The `rosetta` MCP extension config and every mention of it.

### Fixed

- `validate-specs` silently validated nothing (exit 0, no output) when run
  through a symlink, which is how editable installs expose skills. It now
  compares real paths.

### Changed

- Memory log entries may now be up to 400 characters (was 200; still a warning).
  29% of the entries in a real project's log exceeded 200 because the cut-off
  part was the "why" and the cross-reference.
- `/code` B1 now makes the memory lookup visible: the researcher quotes the
  `memory.md` grep pattern and hit count, and the feature spec's *Approach*
  starts with a `Memory consulted: <pattern> — <hits or none relevant>` line.
  The validator warns when an unfinished spec lacks it (finished specs are
  exempt). Before this the lookup was skipped without anyone noticing.
- The global editable Claude install no longer merges the rules into
  `~/.claude/CLAUDE.md` when `~/.claude/rules` already links every rule file,
  and removes an older merged copy (keeping the rest of the file). Claude Code
  loads `rules/` itself, so each rule used to be loaded twice. It falls back to
  merging when a rule file could not be linked.
- `technical-writer` runs on a more capable model, and `engineer` and `tester`
  load `safe-operations` and `testing-playbook`.

