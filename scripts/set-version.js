#!/usr/bin/env node

//
// Sets one version across the whole workspace: root package.json, every
// packages/<name>/package.json, and agent-tools.yaml. Used by the release
// workflow. Edits the version field in place to keep diffs minimal.
//
// Usage: node scripts/set-version.js <version>
//

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error("Usage: node scripts/set-version.js <version>  (e.g. 0.2.0)");
  process.exit(1);
}

async function updatePackageJson(file) {
  const text = await fs.readFile(file, "utf8");
  const updated = text.replace(/("version"\s*:\s*)"[^"]*"/, `$1"${version}"`);

  if (updated === text) {
    console.warn(`! no version field found in ${path.relative(ROOT, file)}`);
    return;
  }

  await fs.writeFile(file, updated, "utf8");
  console.log(`✓ ${path.relative(ROOT, file)} -> ${version}`);
}

async function updateManifest(file) {
  const text = await fs.readFile(file, "utf8");
  const updated = text.replace(/^version:.*$/m, `version: ${version}`);

  if (updated === text) {
    console.warn(`! no version field found in ${path.relative(ROOT, file)}`);
    return;
  }

  await fs.writeFile(file, updated, "utf8");
  console.log(`✓ ${path.relative(ROOT, file)} -> ${version}`);
}

async function main() {
  await updatePackageJson(path.join(ROOT, "package.json"));

  const packagesDir = path.join(ROOT, "packages");
  const entries = await fs.readdir(packagesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const file = path.join(packagesDir, entry.name, "package.json");
    try {
      await fs.access(file);
    } catch {
      continue;
    }
    await updatePackageJson(file);
  }

  await updateManifest(path.join(ROOT, "agent-tools.yaml"));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
