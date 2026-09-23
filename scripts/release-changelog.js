#!/usr/bin/env node

//
// Moves each discovered changelog's `## [Unreleased]` body into a new
// `## [<version>] - <date>` section, re-inserting an empty `## [Unreleased]`
// above it. Discovers root CHANGELOG.md plus every packages/<name>/CHANGELOG.md,
// mirroring set-version.js's glob. Used by the release workflow, run between
// the version-bump step and the build/test step so the release commit and
// tag include the moved entries.
//
// Usage: node scripts/release-changelog.js <version>
//

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error("Usage: node scripts/release-changelog.js <version>  (e.g. 0.2.0)");
  process.exit(1);
}

const UNRELEASED_HEADING = /^## \[Unreleased\][^\n]*\r?\n/m;

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// Computes what release-changelog would do to a changelog's text, without
// writing anything. Throws if the file has no `## [Unreleased]` heading, or
// already has a `## [<version>]` heading (re-releasing the same version
// would otherwise silently duplicate history).
function planUpdate(relFile, text, date) {
  const heading = text.match(UNRELEASED_HEADING);

  if (!heading) {
    throw new Error(`${relFile}: no "## [Unreleased]" heading found`);
  }

  const versionHeading = new RegExp(`^## \\[${escapeRegExp(version)}\\]`, "m");
  if (versionHeading.test(text)) {
    throw new Error(`${relFile}: "## [${version}]" already exists; refusing to duplicate it`);
  }

  const headingEnd = heading.index + heading[0].length;
  const afterHeading = text.slice(headingEnd);
  const nextHeadingOffset = afterHeading.search(/^## /m);
  const bodyEnd = headingEnd + (nextHeadingOffset === -1 ? afterHeading.length : nextHeadingOffset);

  const body = text.slice(headingEnd, bodyEnd);
  const tail = text.slice(bodyEnd);

  if (body.trim() === "") {
    return { write: false };
  }

  const preamble = text.slice(0, headingEnd);
  const content = `${preamble}\n## [${version}] - ${date}\n${body}${tail}`;

  return { write: true, content };
}

async function discoverChangelogFiles() {
  const files = [path.join(ROOT, "CHANGELOG.md")];

  const packagesDir = path.join(ROOT, "packages");
  const entries = await fs.readdir(packagesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const file = path.join(packagesDir, entry.name, "CHANGELOG.md");
    try {
      await fs.access(file);
    } catch {
      continue;
    }
    files.push(file);
  }

  return files;
}

async function main() {
  const date = todayUtc();
  const files = await discoverChangelogFiles();

  // Validate every file before writing any of them, so a failure on one
  // file (e.g. the version is already released) never leaves a partial run
  // that touched some changelogs and not others.
  const plans = files.map(file => {
    return { file, relFile: path.relative(ROOT, file) };
  });

  const texts = await Promise.all(plans.map(plan => fs.readFile(plan.file, "utf8")));
  plans.forEach((plan, index) => {
    plan.result = planUpdate(plan.relFile, texts[index], date);
  });

  for (const plan of plans) {
    if (!plan.result.write) {
      console.log(`- ${plan.relFile} (Unreleased is empty, skipped)`);
      continue;
    }
    await fs.writeFile(plan.file, plan.result.content, "utf8");
    console.log(`✓ ${plan.relFile} -> [${version}] - ${date}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
