import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";

//
// Packaging regression check: every published artifact (root + packages/*)
// must list CHANGELOG.md in its package.json "files" array, and the file
// must actually exist at that artifact's root — otherwise it never reaches
// the published tarball (`npm pack`/`npm publish` only include "files"
// entries), silently defeating per-artifact changelogs.
//

const ROOT = process.cwd();

async function readPackageJson(dir) {
  const text = await fs.readFile(path.join(dir, "package.json"), "utf8");
  return JSON.parse(text);
}

async function assertArtifactShipsChangelog(dir) {
  const pkg = await readPackageJson(dir);
  assert.ok(
    Array.isArray(pkg.files) && pkg.files.includes("CHANGELOG.md"),
    `${path.relative(ROOT, path.join(dir, "package.json"))}'s "files" array must include "CHANGELOG.md"`,
  );
  await assert.doesNotReject(
    fs.access(path.join(dir, "CHANGELOG.md")),
    `expected ${path.relative(ROOT, path.join(dir, "CHANGELOG.md"))} to exist`,
  );
}

test("root package.json ships CHANGELOG.md", async () => {
  await assertArtifactShipsChangelog(ROOT);
});

test("every packages/* package.json ships its own CHANGELOG.md", async () => {
  const packagesDir = path.join(ROOT, "packages");
  const entries = await fs.readdir(packagesDir, { withFileTypes: true });

  const packageDirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const dir = path.join(packagesDir, entry.name);
    try {
      await fs.access(path.join(dir, "package.json"));
    } catch {
      continue;
    }
    packageDirs.push(dir);
  }

  assert.ok(packageDirs.length > 0, "expected at least one package under packages/");

  for (const dir of packageDirs) {
    await assertArtifactShipsChangelog(dir);
  }
});
