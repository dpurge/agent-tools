import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { validateSpecs, validateSpecsDir } from "./validate-specs.js";

async function mktemp() {
  return fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-validate-specs-"));
}

const VALID_MISSION = `---
version: 1
status: approved
updated: 2026-09-16
---

# Mission

## Problem
p

## Users
u

## Value proposition
v

## Non-goals
n
`;

const VALID_FEATURE = `---
title: Add OAuth login
kind: feature
status: draft
version: 1
updated: 2026-09-16
---

# Add OAuth login

## Problem / Motivation
p

## Acceptance Criteria
a

## Approach
ap

## Affected Areas
aa

## Out of Scope
oos

## Implementation Notes
Not started.

## Validation
Not started.

## Documentation Review
Not started.

## Documentation Updates
Not started.
`;

test("returns no errors when specs/ does not exist", async () => {
  const dir = await mktemp();
  const { errors, warnings } = await validateSpecs(dir);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  await fs.rm(dir, { recursive: true, force: true });
});

test("accepts a well-formed constitution file", async () => {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "mission.md"), VALID_MISSION);

  const { errors } = await validateSpecs(dir);
  assert.deepEqual(errors, []);

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a constitution file with wrong sections", async () => {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs"), { recursive: true });
  await fs.writeFile(
    path.join(dir, "specs", "mission.md"),
    VALID_MISSION.replace("## Non-goals", "## Extra Section")
  );

  const { errors } = await validateSpecs(dir);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /mission\.md/);
  assert.match(errors[0], /sections must be exactly/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a constitution file with an invalid status", async () => {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "mission.md"), VALID_MISSION.replace("status: approved", "status: wip"));

  const { errors } = await validateSpecs(dir);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /'status'/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a constitution file with a non-integer version", async () => {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "mission.md"), VALID_MISSION.replace("version: 1", 'version: "one"'));

  const { errors } = await validateSpecs(dir);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /'version'/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("accepts a well-formed feature spec file", async () => {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs", "features"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "features", "oauth-login.md"), VALID_FEATURE);

  const { errors } = await validateSpecs(dir);
  assert.deepEqual(errors, []);

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a feature spec file with an invalid kind or missing title", async () => {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs", "features"), { recursive: true });
  await fs.writeFile(
    path.join(dir, "specs", "features", "bad.md"),
    VALID_FEATURE.replace("kind: feature", "kind: enhancement").replace("title: Add OAuth login", "title:")
  );

  const { errors } = await validateSpecs(dir);
  assert.equal(errors.length, 2);
  assert.ok(errors.some(e => e.includes("'kind'")));
  assert.ok(errors.some(e => e.includes("'title'")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("warns but does not error when specs/ exists without a features/ directory", async () => {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "mission.md"), VALID_MISSION);

  const { errors, warnings } = await validateSpecs(dir);
  assert.deepEqual(errors, []);
  assert.ok(warnings.some(w => w.includes("features/")));

  await fs.rm(dir, { recursive: true, force: true });
});

const VALID_ROADMAP = `---
version: 1
status: approved
updated: 2026-09-16
---

# Roadmap

## Now
n

## Next
x

## Later
l

## Out of scope
o
`;

// A roadmap missing its final '## Out of scope' section — used to exercise
// the "declared path exists but fails the schema" and "validated exactly
// once, not twice" cases without needing a second distinct failure shape.
const ROADMAP_MISSING_OUT_OF_SCOPE = VALID_ROADMAP.replace("## Out of scope\no\n", "");

/**
 * Builds a full tech-stack.md, with `artifactsBlock` (expected to start with
 * '### Artifacts') spliced into '## Infrastructure & tooling', matching
 * where the constitution-format skill nests the Artifacts subsection.
 */
function techStackWithArtifacts(artifactsBlock) {
  return `---
version: 1
status: approved
updated: 2026-09-16
---

# Tech Stack

## Languages & runtimes
l

## Frameworks & libraries
f

## Infrastructure & tooling
i

${artifactsBlock}

## Key conventions
k
`;
}

async function writeTechStack(dir, content) {
  await fs.mkdir(path.join(dir, "specs"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "tech-stack.md"), content);
}

async function writeRoadmapAt(dir, relPath, content) {
  const file = path.join(dir, relPath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

test("discovers and validates 2+ distinct declared Roadmap paths", async () => {
  const dir = await mktemp();
  await writeTechStack(
    dir,
    techStackWithArtifacts(`### Artifacts

| Artifact | Root | Roadmap |
| --- | --- | --- |
| App A | app-a | app-a/roadmap.md |
| App B | app-b | app-b/roadmap.md |`)
  );
  await writeRoadmapAt(dir, "app-a/roadmap.md", VALID_ROADMAP);
  await writeRoadmapAt(dir, "app-b/roadmap.md", VALID_ROADMAP);

  const { errors } = await validateSpecs(dir);
  assert.deepEqual(errors, []);

  await fs.rm(dir, { recursive: true, force: true });
});

test("errors on a declared Roadmap path that doesn't exist on disk", async () => {
  const dir = await mktemp();
  await writeTechStack(
    dir,
    techStackWithArtifacts(`### Artifacts

| Artifact | Root | Roadmap |
| --- | --- | --- |
| App A | app-a | app-a/roadmap.md |`)
  );

  const { errors } = await validateSpecs(dir);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^app-a\/roadmap\.md:/);
  assert.match(errors[0], /does not exist/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("errors on a declared Roadmap path that exists but has the wrong sections", async () => {
  const dir = await mktemp();
  await writeTechStack(
    dir,
    techStackWithArtifacts(`### Artifacts

| Artifact | Root | Roadmap |
| --- | --- | --- |
| App A | app-a | app-a/roadmap.md |`)
  );
  await writeRoadmapAt(dir, "app-a/roadmap.md", ROADMAP_MISSING_OUT_OF_SCOPE);

  const { errors } = await validateSpecs(dir);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^app-a\/roadmap\.md:/);
  assert.match(errors[0], /sections must be exactly/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("validates a Roadmap value shared by two rows exactly once, not twice", async () => {
  const dir = await mktemp();
  await writeTechStack(
    dir,
    techStackWithArtifacts(`### Artifacts

| Artifact | Root | Roadmap |
| --- | --- | --- |
| App A | app-a | app-a/roadmap.md |
| App A Mirror | app-a-mirror | app-a/roadmap.md |`)
  );
  // Deliberately invalid, so a duplicate-validation bug would show up as two
  // matching error lines instead of one.
  await writeRoadmapAt(dir, "app-a/roadmap.md", ROADMAP_MISSING_OUT_OF_SCOPE);

  const { errors } = await validateSpecs(dir);
  const matching = errors.filter(e => e.includes("app-a/roadmap.md"));
  assert.equal(matching.length, 1);

  await fs.rm(dir, { recursive: true, force: true });
});

test("sees zero behavior change for an Artifacts table with no Roadmap column", async () => {
  const dir = await mktemp();
  // Mirrors this repo's own real '### Artifacts' table shape (specs/tech-stack.md):
  // Artifact/Root/Changelog/Versioning, no Roadmap column at all.
  await writeTechStack(
    dir,
    techStackWithArtifacts(`### Artifacts

| Artifact | Root | Changelog | Versioning |
| --- | --- | --- | --- |
| agent-tools | . | CHANGELOG.md | lockstep (package.json) |
| claude-agent-tools-plugin | packages/claude-agent-tools-plugin | packages/claude-agent-tools-plugin/CHANGELOG.md | lockstep (package.json) |

Built from: the packages/* artifacts are assembled from core/ by scripts/build.js.`)
  );

  const { errors } = await validateSpecs(dir);
  assert.deepEqual(errors, []);

  await fs.rm(dir, { recursive: true, force: true });
});

test("errors on a malformed Artifacts table with a mismatched row cell count", async () => {
  const dir = await mktemp();
  await writeTechStack(
    dir,
    techStackWithArtifacts(`### Artifacts

| Artifact | Root | Roadmap |
| --- | --- | --- |
| App A | app-a |`)
  );

  const { errors } = await validateSpecs(dir);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /tech-stack\.md/);
  assert.match(errors[0], /has 2 cell\(s\), expected 3/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("errors on an Artifacts heading with no table following it", async () => {
  const dir = await mktemp();
  await writeTechStack(
    dir,
    techStackWithArtifacts(`### Artifacts

No table follows this heading, just prose.`)
  );

  const { errors } = await validateSpecs(dir);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /tech-stack\.md/);
  assert.match(errors[0], /no markdown table follows it/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("resolves a declared Roadmap path against the true project root for a shadow .agent/specs root", async () => {
  const dir = await mktemp();
  const specsDir = path.join(dir, ".agent", "specs");
  await fs.mkdir(specsDir, { recursive: true });
  await fs.writeFile(
    path.join(specsDir, "tech-stack.md"),
    techStackWithArtifacts(`### Artifacts

| Artifact | Root | Roadmap |
| --- | --- | --- |
| App A | app-a | app-a/roadmap.md |`)
  );
  // app-a/roadmap.md is relative to the project root (dir), not to .agent/ —
  // if projectRoot were computed one directory short, this file would not
  // be found at dir/.agent/app-a/roadmap.md.
  await writeRoadmapAt(dir, "app-a/roadmap.md", VALID_ROADMAP);

  // Mirrors main()'s own shadow-root detection in validate-specs.js.
  const isShadowRoot = path.basename(path.dirname(specsDir)) === ".agent";
  const projectRoot = isShadowRoot ? path.dirname(path.dirname(specsDir)) : path.dirname(specsDir);
  assert.equal(projectRoot, dir);

  const { errors } = await validateSpecsDir(specsDir, ".agent/specs/", projectRoot);
  assert.deepEqual(errors, []);

  await fs.rm(dir, { recursive: true, force: true });
});

const MEMORY_HEADER_LINES = [
  "# Project Memory",
  "",
  "<!-- Append-only, one entry per line: `YYYY-MM-DDTHH:MM:SSZ [tag] text`. See the `memory-format` skill. Do not read this file in full — grep it. -->",
  "",
];

function memoryFile(entries) {
  return [...MEMORY_HEADER_LINES, ...entries].join("\n") + "\n";
}

const VALID_MEMORY = memoryFile([
  "2026-09-16T10:00:00Z [build] npm test runs the full suite in one command.",
  "2026-09-16T10:01:00Z [gotcha] validate-specs coerces unquoted YAML dates to Date objects.",
]);

async function writeMemory(dir, content) {
  await fs.mkdir(path.join(dir, "specs"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "memory.md"), content);
}

test("accepts a well-formed memory file", async () => {
  const dir = await mktemp();
  await writeMemory(dir, VALID_MEMORY);

  const { errors, warnings } = await validateSpecs(dir);
  assert.deepEqual(errors, []);
  assert.ok(!warnings.some(w => w.includes("memory.md")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("accepts a memory file with CRLF line endings", async () => {
  const dir = await mktemp();
  await writeMemory(dir, VALID_MEMORY.replace(/\n/g, "\r\n"));

  const { errors } = await validateSpecs(dir);
  assert.deepEqual(errors, []);

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory file with a wrong header", async () => {
  const dir = await mktemp();
  await writeMemory(dir, VALID_MEMORY.replace("# Project Memory", "# Memory Log"));

  const { errors } = await validateSpecs(dir);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /header line 1/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory file with a blank line between entries", async () => {
  const dir = await mktemp();
  await writeMemory(
    dir,
    memoryFile(["2026-09-16T10:00:00Z [build] first entry.", "", "2026-09-16T10:01:00Z [build] second entry."])
  );

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("blank line between entries")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory entry with a tag outside the closed set", async () => {
  const dir = await mktemp();
  await writeMemory(dir, memoryFile(["2026-09-16T10:00:00Z [misc] some fact."]));

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("tag 'misc' is not one of")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory entry with a malformed timestamp", async () => {
  const dir = await mktemp();
  await writeMemory(dir, memoryFile(["2026-09-16T10:00:00 [build] missing the trailing Z."]));

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("does not match 'YYYY-MM-DDTHH:MM:SSZ [tag] text'")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory entry containing an absolute path", async () => {
  const dir = await mktemp();
  await writeMemory(dir, memoryFile(["2026-09-16T10:00:00Z [env] config lives at /Users/example/project/config.yaml."]));

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("non-portable reference")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory entry containing a home-directory reference", async () => {
  const dir = await mktemp();
  await writeMemory(dir, memoryFile(["2026-09-16T10:00:00Z [env] the tool caches under ~/.cache/thing."]));

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("non-portable reference")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory entry containing a Windows drive path", async () => {
  const dir = await mktemp();
  await writeMemory(dir, memoryFile(["2026-09-16T10:00:00Z [env] logs land in C:\\Users\\example\\AppData\\thing."]));

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("non-portable reference")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects and never echoes a secret-shaped memory entry", async () => {
  const dir = await mktemp();
  const fakeToken = "ghp_abcdefghijklmnopqrstuvwxyz0123456789";
  await writeMemory(dir, memoryFile([`2026-09-16T10:00:00Z [gotcha] token is ${fakeToken} for the deploy bot.`]));

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("[REDACTED:GITHUB_TOKEN]")));
  assert.ok(!errors.some(e => e.includes(fakeToken)));

  await fs.rm(dir, { recursive: true, force: true });
});

test("warns (does not error) on an over-long memory entry", async () => {
  const dir = await mktemp();
  const longText = "x".repeat(450);
  await writeMemory(dir, memoryFile([`2026-09-16T10:00:00Z [domain] ${longText}`]));

  const { errors, warnings } = await validateSpecs(dir);
  assert.deepEqual(errors, []);
  assert.ok(warnings.some(w => w.includes("exceeds 400 characters")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("warns (does not error) on an out-of-order timestamp", async () => {
  const dir = await mktemp();
  await writeMemory(
    dir,
    memoryFile(["2026-09-16T10:01:00Z [build] later entry first.", "2026-09-16T10:00:00Z [build] earlier entry second."])
  );

  const { errors, warnings } = await validateSpecs(dir);
  assert.deepEqual(errors, []);
  assert.ok(warnings.some(w => w.includes("out of order")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("warns (does not error) on an exact duplicate entry", async () => {
  const dir = await mktemp();
  const line = "2026-09-16T10:00:00Z [build] the exact same fact.";
  await writeMemory(dir, memoryFile([line, line]));

  const { errors, warnings } = await validateSpecs(dir);
  assert.deepEqual(errors, []);
  assert.ok(warnings.some(w => w.includes("exact duplicate")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory entry wrapped in backticks or quotes containing a non-portable path", async () => {
  const dir = await mktemp();
  await writeMemory(
    dir,
    memoryFile(["2026-09-16T10:00:00Z [env] config lives at `/Users/example/project/config.yaml` per the docs."])
  );

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("non-portable reference")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory entry containing a forward-slash Windows drive path", async () => {
  const dir = await mktemp();
  await writeMemory(dir, memoryFile(["2026-09-16T10:00:00Z [env] build output lands in C:/Program Files/thing."]));

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("non-portable reference")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects and never echoes an Anthropic-style secret key", async () => {
  const dir = await mktemp();
  const fakeKey = "sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789";
  await writeMemory(dir, memoryFile([`2026-09-16T10:00:00Z [gotcha] key is ${fakeKey} for the CI bot.`]));

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("[REDACTED:API_KEY]")));
  assert.ok(!errors.some(e => e.includes(fakeKey)));

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects a memory entry containing a bidirectional-override character without echoing it", async () => {
  const dir = await mktemp();
  const sneaky = `2026-09-16T10:00:00Z [gotcha] safe looking text \u202Ednammoc suoicsam a si siht.`;
  await writeMemory(dir, memoryFile([sneaky]));

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("control, formatting, or bidirectional-override character")));
  assert.ok(!errors.some(e => e.includes("\u202E")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("still scans entries for secrets even when the header is wrong", async () => {
  const dir = await mktemp();
  const fakeToken = "ghp_zyxwvutsrqponmlkjihgfedcba9876543210";
  const badHeaderFile = memoryFile([`2026-09-16T10:00:00Z [gotcha] token is ${fakeToken}.`]).replace(
    "# Project Memory",
    "# Memory Log"
  );
  await writeMemory(dir, badHeaderFile);

  const { errors } = await validateSpecs(dir);
  assert.ok(errors.some(e => e.includes("header line 1")));
  assert.ok(errors.some(e => e.includes("[REDACTED:GITHUB_TOKEN]")), "header mismatch must not suppress secret scanning");
  assert.ok(!errors.some(e => e.includes(fakeToken)));

  await fs.rm(dir, { recursive: true, force: true });
});

test("warns (does not error) once entry count exceeds the 200-entry threshold", async () => {
  const dir = await mktemp();
  const entries = Array.from({ length: 201 }, (_, i) => {
    const timestamp = new Date(Date.UTC(2026, 8, 16, 10, 0, 0) + i * 1000)
      .toISOString()
      .replace(/\.\d{3}Z$/, "Z");
    return `${timestamp} [domain] entry number ${i}.`;
  });
  await writeMemory(dir, memoryFile(entries));

  const { errors, warnings } = await validateSpecs(dir);
  assert.deepEqual(errors, []);
  assert.ok(warnings.some(w => w.includes("201 entries exceeds the 200-entry threshold")));

  await fs.rm(dir, { recursive: true, force: true });
});

test("does not warn about a memory entry between 200 and 400 characters", async () => {
  const dir = await mktemp();
  await writeMemory(dir, memoryFile([`2026-09-16T10:00:00Z [domain] ${"x".repeat(250)}`]));

  const { errors, warnings } = await validateSpecs(dir);
  assert.deepEqual(errors, []);
  assert.ok(!warnings.some(w => w.includes("characters")));

  await fs.rm(dir, { recursive: true, force: true });
});

async function featureWarnings(featureText) {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs", "features"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "features", "sample.md"), featureText);
  const result = await validateSpecs(dir);
  await fs.rm(dir, { recursive: true, force: true });
  return result;
}

const DONE_FEATURE = VALID_FEATURE.replace("status: draft", "status: done").replaceAll("Not started.", "Done.");

const MEMORY_LINE = "Memory consulted: [gotcha] helm — 2 relevant entries";

test("warns when an unfinished feature spec's Approach lacks the Memory consulted line", async () => {
  const { errors, warnings } = await featureWarnings(VALID_FEATURE);
  assert.deepEqual(errors, []);
  assert.ok(warnings.some(w => w.includes("Memory consulted")));
});

test("does not warn when Approach starts with the Memory consulted line", async () => {
  const { errors, warnings } = await featureWarnings(VALID_FEATURE.replace("## Approach\nap", `## Approach\n${MEMORY_LINE}\nap`));
  assert.deepEqual(errors, []);
  assert.ok(!warnings.some(w => w.includes("Memory consulted")));
});

test("does not ask a finished feature spec for the Memory consulted line", async () => {
  const { errors, warnings } = await featureWarnings(DONE_FEATURE);
  assert.deepEqual(errors, []);
  assert.ok(!warnings.some(w => w.includes("Memory consulted")));
});

test("a Memory consulted line in another section does not satisfy the Approach check", async () => {
  const text = VALID_FEATURE.replace("## Affected Areas\naa", `## Affected Areas\n${MEMORY_LINE}`);
  const { warnings } = await featureWarnings(text);
  assert.ok(warnings.some(w => w.includes("Memory consulted")));
});

test("errors when a done feature spec still has a Not started. section, naming spec and section", async () => {
  for (const section of ["Implementation Notes", "Validation", "Documentation Review", "Documentation Updates"]) {
    const text = DONE_FEATURE.replace(`## ${section}\nDone.`, `## ${section}\nNot started.`);
    const { errors } = await featureWarnings(text);
    assert.deepEqual(errors, [`specs/features/sample.md: status is done but section '${section}' is still "Not started."`]);
  }
});

test("does not error on Not started. in a spec that is not done, or when a done spec has real content", async () => {
  const notDone = await featureWarnings(VALID_FEATURE.replace("status: draft", "status: documenting"));
  assert.deepEqual(notDone.errors, []);
  const done = await featureWarnings(DONE_FEATURE.replace("## Validation\nDone.", "## Validation\n12 pass, 0 skip.\nNot started."));
  assert.deepEqual(done.errors, []);
});

const IMPLEMENTING_FEATURE = VALID_FEATURE.replace("status: draft", "status: implementing");

async function stalledWarnings(text, today) {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs", "features"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "features", "sample.md"), text);
  const result = await validateSpecs(dir, { today });
  await fs.rm(dir, { recursive: true, force: true });
  return result.warnings.filter(w => w.includes("stalled"));
}

test("warns when implementing, validating or documenting work was last updated more than 2 days ago", async () => {
  for (const status of ["implementing", "validating", "documenting"]) {
    const text = VALID_FEATURE.replace("status: draft", `status: ${status}`);
    assert.deepEqual(await stalledWarnings(text, "2026-09-19"), [
      `specs/features/sample.md: stalled: sample has been ${status} since 2026-09-16; finish B3-B5 or say why`,
    ]);
  }
});

test("does not warn at exactly 2 days, for draft/approved/done specs, or for an unquoted date", async () => {
  assert.deepEqual(await stalledWarnings(IMPLEMENTING_FEATURE, "2026-09-18"), []);
  assert.deepEqual(await stalledWarnings(VALID_FEATURE, "2026-12-01"), []);
  assert.deepEqual(await stalledWarnings(DONE_FEATURE, "2026-12-01"), []);
  assert.equal((await stalledWarnings(IMPLEMENTING_FEATURE.replace("updated: 2026-09-16", 'updated: "2026-09-16"'), "2026-09-19")).length, 1);
});

async function nowCheck({ now, featureStatus, writeFeature = true, roadmapPath = "specs/roadmap.md", artifacts = false }) {
  const dir = await mktemp();
  await writeRoadmapAt(dir, roadmapPath, VALID_ROADMAP.replace("## Now\nn", `## Now\n${now}`));
  if (artifacts) {
    await writeTechStack(
      dir,
      techStackWithArtifacts(
        "### Artifacts\n\n| Artifact | Root | Roadmap |\n| --- | --- | --- |\n| app | app/ | `" + roadmapPath + "` |"
      )
    );
  }
  if (writeFeature) {
    const text = DONE_FEATURE.replace("status: done", `status: ${featureStatus}`).replaceAll("Done.", "Not started.");
    await writeRoadmapAt(dir, "specs/features/login.md", featureStatus === "done" ? DONE_FEATURE : text);
  }
  const result = await validateSpecs(dir);
  await fs.rm(dir, { recursive: true, force: true });
  return result;
}

const NOW_LINE = "- Add login — branch `login` — specs/features/login.md";

test("errors when a Now line points to a done feature spec", async () => {
  const { errors } = await nowCheck({ now: NOW_LINE, featureStatus: "done" });
  assert.deepEqual(errors, ["specs/roadmap.md: closed feature still listed in Now: login (remove the line, /code B5)"]);
});

test("accepts a Now line pointing to a feature spec that is still in flight", async () => {
  const { errors } = await nowCheck({ now: NOW_LINE, featureStatus: "implementing" });
  assert.deepEqual(errors, []);
});

test("warns, without erroring, when a Now line points to a missing feature spec", async () => {
  const { errors, warnings } = await nowCheck({ now: NOW_LINE, featureStatus: "done", writeFeature: false });
  assert.deepEqual(errors, []);
  assert.ok(warnings.includes("specs/roadmap.md: Now line points to a feature spec that does not exist: specs/features/login.md"));
});

test("ignores Now lines without a feature spec path", async () => {
  const { errors, warnings } = await nowCheck({ now: "- something in flight", featureStatus: "done", writeFeature: false });
  assert.deepEqual(errors, []);
  assert.ok(!warnings.some(w => w.includes("Now line")));
});

test("checks the Now section of a declared per-artifact roadmap too", async () => {
  const { errors } = await nowCheck({
    now: NOW_LINE,
    featureStatus: "done",
    roadmapPath: "specs/artifacts/app/roadmap.md",
    artifacts: true,
  });
  assert.deepEqual(errors, [
    "specs/artifacts/app/roadmap.md: closed feature still listed in Now: login (remove the line, /code B5)",
  ]);
});

test("--today and VALIDATE_SPECS_TODAY drive the CLI staleness check", async () => {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs", "features"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "features", "sample.md"), IMPLEMENTING_FEATURE);
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "validate-specs.js");
  const run = (args, env = {}) =>
    spawnSync(process.execPath, [script, `--target=${dir}`, ...args], { encoding: "utf8", env: { ...process.env, ...env } });

  assert.match(run(["--today=2026-09-19"]).stdout, /stalled: sample has been implementing since 2026-09-16/);
  assert.doesNotMatch(run(["--today=2026-09-18"]).stdout, /stalled/);
  assert.match(run([], { VALIDATE_SPECS_TODAY: "2026-09-19" }).stdout, /stalled/);
  assert.notEqual(run(["--today=tomorrow"]).status, 0);

  await fs.rm(dir, { recursive: true, force: true });
});

// E3: a done spec updated on or after 2026-10-24 records its CI/release decision.
const CI_ERROR = "specs/features/sample.md: status is done but Documentation Review has no CI/release decision";
const lateDone = (review = "Done.") =>
  DONE_FEATURE.replace("updated: 2026-09-16", "updated: 2026-10-24").replace("## Documentation Review\nDone.", `## Documentation Review\n${review}`);
const ciErrors = async (text, options) => {
  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs", "features"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "features", "sample.md"), text);
  const result = await validateSpecs(dir, options);
  await fs.rm(dir, { recursive: true, force: true });
  return result.errors.filter(e => e.includes("CI/release decision"));
};

test("errors when a done spec updated from the cutoff on has no CI/release decision", async () => {
  const errors = await ciErrors(lateDone());
  assert.equal(errors.length, 1);
  assert.ok(errors[0].startsWith(CI_ERROR));
  assert.match(errors[0], /"\{file, needs change: yes\/no, reason\}".*"CI review: not applicable \(reason\)"/);
});

test("accepts a needs change decision (any case, either answer) or a CI review: not applicable line", async () => {
  for (const review of [
    "{`.github/workflows/ci.yml`, needs change: yes, new test step}",
    "{Taskfile.yml, needs change: no, no new command}",
    "Needs Change:   NO - reason",
    "Docs only.\nCI review: not applicable (no build or release input changed)",
  ]) {
    assert.deepEqual(await ciErrors(lateDone(review)), [], review);
  }
  // The not-applicable form counts only at the start of a line.
  assert.equal((await ciErrors(lateDone("see: CI review: not applicable"))).length, 1);
});

test("does not require the CI decision for older done specs or for specs that are not done", async () => {
  assert.deepEqual(await ciErrors(DONE_FEATURE), []);
  assert.deepEqual(await ciErrors(lateDone().replace("updated: 2026-10-24", "updated: 2026-10-23")), []);
  assert.deepEqual(await ciErrors(lateDone().replace("status: done", "status: documenting")), []);
});

test("the CI decision cutoff compares the spec's updated date, not --today", async () => {
  assert.equal((await ciErrors(lateDone(), { today: "2026-01-01" })).length, 1);
  assert.deepEqual(await ciErrors(DONE_FEATURE, { today: "2027-06-01" }), []);

  const dir = await mktemp();
  await fs.mkdir(path.join(dir, "specs", "features"), { recursive: true });
  await fs.writeFile(path.join(dir, "specs", "features", "sample.md"), lateDone());
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "validate-specs.js");
  for (const today of ["2026-01-01", "2027-06-01"]) {
    const run = spawnSync(process.execPath, [script, `--target=${dir}`, `--today=${today}`], { encoding: "utf8" });
    assert.notEqual(run.status, 0);
    assert.match(run.stdout + run.stderr, /Documentation Review has no CI\/release decision/);
  }
  await fs.rm(dir, { recursive: true, force: true });
});
