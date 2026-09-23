import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const SCRIPT = path.join(ROOT, "scripts", "release-changelog.js");

function runScript(args, cwd) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: "utf8" });
}

async function makeFixture() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-release-changelog-"));
  await fs.mkdir(path.join(dir, "packages"), { recursive: true });
  return dir;
}

const CHANGELOG_WITH_ENTRIES = `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Something new.

## [0.1.0] - 2026-01-01

### Added

- Initial release.
`;

const CHANGELOG_EMPTY_UNRELEASED = `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.1.0] - 2026-01-01

### Added

- Initial release.
`;

const CHANGELOG_NO_UNRELEASED = `# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-01-01

### Added

- Initial release.
`;

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

test("moves a non-empty Unreleased body into a new versioned section", async () => {
  const dir = await makeFixture();
  const file = path.join(dir, "CHANGELOG.md");
  await fs.writeFile(file, CHANGELOG_WITH_ENTRIES, "utf8");

  const result = runScript(["1.2.3"], dir);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const content = await fs.readFile(file, "utf8");
  const date = todayUtc();

  assert.match(content, /## \[Unreleased\]\n\n## \[1\.2\.3\] - \d{4}-\d{2}-\d{2}\n/);
  assert.match(content, new RegExp(`## \\[1\\.2\\.3\\] - ${date}\\n\\n### Added\\n\\n- Something new\\.`));
  assert.match(content, /## \[0\.1\.0\] - 2026-01-01/);
  assert.match(result.stdout, new RegExp(`✓ CHANGELOG\\.md -> \\[1\\.2\\.3\\] - ${date}`));

  await fs.rm(dir, { recursive: true, force: true });
});

test("updates multiple changelogs (root and a package) in one run", async () => {
  const dir = await makeFixture();
  await fs.mkdir(path.join(dir, "packages", "pkg-a"), { recursive: true });

  const rootFile = path.join(dir, "CHANGELOG.md");
  const packageFile = path.join(dir, "packages", "pkg-a", "CHANGELOG.md");
  await fs.writeFile(rootFile, CHANGELOG_WITH_ENTRIES, "utf8");
  await fs.writeFile(packageFile, CHANGELOG_WITH_ENTRIES, "utf8");

  const result = runScript(["2.0.0"], dir);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const rootContent = await fs.readFile(rootFile, "utf8");
  const packageContent = await fs.readFile(packageFile, "utf8");

  assert.match(rootContent, /## \[2\.0\.0\]/);
  assert.match(packageContent, /## \[2\.0\.0\]/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("leaves a changelog with an empty Unreleased section untouched", async () => {
  const dir = await makeFixture();
  const file = path.join(dir, "CHANGELOG.md");
  await fs.writeFile(file, CHANGELOG_EMPTY_UNRELEASED, "utf8");

  const result = runScript(["1.0.0"], dir);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const content = await fs.readFile(file, "utf8");
  assert.equal(content, CHANGELOG_EMPTY_UNRELEASED);
  assert.match(result.stdout, /skipped/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("skips a package directory with no CHANGELOG.md without error", async () => {
  const dir = await makeFixture();
  await fs.mkdir(path.join(dir, "packages", "pkg-without-changelog"), { recursive: true });

  const rootFile = path.join(dir, "CHANGELOG.md");
  await fs.writeFile(rootFile, CHANGELOG_WITH_ENTRIES, "utf8");

  const result = runScript(["1.0.0"], dir);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const rootContent = await fs.readFile(rootFile, "utf8");
  assert.match(rootContent, /## \[1\.0\.0\]/);

  await fs.rm(dir, { recursive: true, force: true });
});

test("fails loudly and leaves the file untouched when the version heading already exists", async () => {
  const dir = await makeFixture();
  const file = path.join(dir, "CHANGELOG.md");
  const alreadyReleased = CHANGELOG_WITH_ENTRIES.replace("## [0.1.0]", "## [1.2.3]");
  await fs.writeFile(file, alreadyReleased, "utf8");

  const result = runScript(["1.2.3"], dir);
  assert.notEqual(result.status, 0);

  const content = await fs.readFile(file, "utf8");
  assert.equal(content, alreadyReleased);

  await fs.rm(dir, { recursive: true, force: true });
});

test("fails loudly and leaves the file untouched when there is no Unreleased heading", async () => {
  const dir = await makeFixture();
  const file = path.join(dir, "CHANGELOG.md");
  await fs.writeFile(file, CHANGELOG_NO_UNRELEASED, "utf8");

  const result = runScript(["1.0.0"], dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /no "## \[Unreleased\]" heading found/);

  const content = await fs.readFile(file, "utf8");
  assert.equal(content, CHANGELOG_NO_UNRELEASED);

  await fs.rm(dir, { recursive: true, force: true });
});

test("rejects an invalid version string before touching any file", async () => {
  const dir = await makeFixture();
  const file = path.join(dir, "CHANGELOG.md");
  await fs.writeFile(file, CHANGELOG_WITH_ENTRIES, "utf8");

  for (const invalid of ["1.2", "abc", ""]) {
    const result = runScript(invalid === "" ? [] : [invalid], dir);
    assert.notEqual(result.status, 0);
  }

  const content = await fs.readFile(file, "utf8");
  assert.equal(content, CHANGELOG_WITH_ENTRIES);

  await fs.rm(dir, { recursive: true, force: true });
});

test("running twice with the same version fails loudly on the second run instead of duplicating", async () => {
  const dir = await makeFixture();
  const file = path.join(dir, "CHANGELOG.md");
  await fs.writeFile(file, CHANGELOG_WITH_ENTRIES, "utf8");

  const first = runScript(["1.2.3"], dir);
  assert.equal(first.status, 0, first.stderr || first.stdout);

  const afterFirstRun = await fs.readFile(file, "utf8");

  const second = runScript(["1.2.3"], dir);
  assert.notEqual(second.status, 0);

  const afterSecondRun = await fs.readFile(file, "utf8");
  assert.equal(afterSecondRun, afterFirstRun);

  const versionHeadingCount = (afterSecondRun.match(/## \[1\.2\.3\]/g) || []).length;
  assert.equal(versionHeadingCount, 1);

  await fs.rm(dir, { recursive: true, force: true });
});
