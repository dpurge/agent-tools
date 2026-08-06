#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  ensureDir,
  fail,
  ok,
  parseEditableInstallerArgs,
  piAgentDir,
  writeExtensionShim,
} from "./lib/install-common.js";

const { force, targetDir } = parseEditableInstallerArgs();
const globalInstall = !targetDir;
const extensionDir = globalInstall
  ? path.join(piAgentDir(), "extensions")
  : path.join(targetDir, ".pi", "extensions");
const shimFile = path.join(extensionDir, "agent-tools.ts");
const adapterEntry = path.join(ROOT, "adapters", "pi", "index.js");

async function main() {
  console.log("\nInstalling editable agent-tools for Pi\n");

  await ensureDir(extensionDir);
  await writeExtensionShim(shimFile, adapterEntry, { force });

  console.log(`
Editable Pi installation complete.

Installed:

  ${shimFile}

Source repo:

  ${ROOT}

Behavior:

  - Pi loads the repo's development adapter directly
  - commands/skills/agents/workflows are read from core/
  - changes appear in new Pi sessions without rebuilding
  - for a running Pi session, use /reload or restart Pi
`);

  if (globalInstall) {
    ok("Installed globally for all Pi sessions");
  } else {
    ok("Installed project-locally for this Pi workspace");
  }
}

main().catch(err => {
  fail(err.message);
  process.exit(1);
});
