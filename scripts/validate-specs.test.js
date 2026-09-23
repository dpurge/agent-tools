import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

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
  const longText = "x".repeat(250);
  await writeMemory(dir, memoryFile([`2026-09-16T10:00:00Z [domain] ${longText}`]));

  const { errors, warnings } = await validateSpecs(dir);
  assert.deepEqual(errors, []);
  assert.ok(warnings.some(w => w.includes("exceeds 200 characters")));

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
