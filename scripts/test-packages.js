#!/usr/bin/env node

//
// Runs `npm test` in every package under packages/. Cross-platform replacement
// for a shell loop so `npm test` at the root can cover the packages too.
//

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const packagesDir = path.join(ROOT, "packages");

let failed = false;

for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }

  const dir = path.join(packagesDir, entry.name);
  if (!fs.existsSync(path.join(dir, "package.json"))) {
    continue;
  }

  console.log(`\n> testing ${entry.name}`);

  const result = spawnSync("npm", ["test"], {
    cwd: dir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
