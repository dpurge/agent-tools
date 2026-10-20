---
name: spec-validation
description: Run the specs validator (constitution, feature specs and memory log against their strict formats) from any project and any host, with no install, no linked agent-tools command and no node_modules. Use whenever `/code` or another instruction says to run `validate-specs`, and before telling anyone the validator is unavailable.
version: 1.0.0
---

# Spec Validation

## Purpose

`/code` and the spec-format skills require `validate-specs` after every write
under the specs root. The validator ships **inside this skill** as one
self-contained file, `validate-specs.mjs`, next to this `SKILL.md`. It needs
only Node.js (no `npm install`, no `agent-tools` on the `PATH`, no copy of the
agent-tools repository), so it works in any project. Do not report the
validator as unavailable until you have tried the steps below.

## Run it

From the project root, run the script that sits in the same directory as this
file (the host shows that directory when it loads the skill):

```sh
node <this-skill-directory>/validate-specs.mjs                       # checks ./specs
node <this-skill-directory>/validate-specs.mjs --dir=.agent/specs    # a shadow specs root
node <this-skill-directory>/validate-specs.mjs --target=/abs/project # another project's ./specs
```

- Exit code 0: no errors (warnings are printed and do not fail the run).
  Exit code 1: errors, listed one per line with the file and the problem.
- "Directory does not exist yet — nothing to validate" is a pass.
- Pass `--dir=<specs-root>` whenever the specs root is not the default
  `specs/` (see `/code`, step A0), or the real one goes unchecked.

## If you do not know the skill directory

Look for the script in the usual skill locations, project first:

```sh
for d in .claude/skills .opencode/skills .pi/skills .agents/skills \
         ~/.claude/skills ~/.config/opencode/skills ~/.pi/agent/skills ~/.agents/skills; do
  [ -f "$d/spec-validation/validate-specs.mjs" ] && { echo "$d/spec-validation/validate-specs.mjs"; break; }
done
```

Inside the agent-tools repository itself, `npm run validate:specs` works too,
and if the `agent-tools` command happens to be installed,
`agent-tools validate-specs` is the same validator.

## If you really cannot run it

Say so plainly ("the validator could not be run: <reason>"), then check the
files by hand against `constitution-format`, `feature-spec-format` and
`memory-format`, and label that result **manual, not machine-validated**. Never
write "validation passed" for a check you did not run.

## Report

State the command you ran, the specs root it checked, the exit code, and any
errors or warnings quoted verbatim.
