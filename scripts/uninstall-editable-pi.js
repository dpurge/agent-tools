#!/usr/bin/env node

import path from "node:path";
import {
  fail,
  ok,
  parseEditableInstallerArgs,
  piAgentDir,
  removePath,
} from "./lib/install-common.js";

const { targetDir } = parseEditableInstallerArgs();
const globalInstall = !targetDir;
const shimFile = globalInstall
  ? path.join(piAgentDir(), "extensions", "agent-tools.ts")
  : path.join(targetDir, ".pi", "extensions", "agent-tools.ts");

async function main() {
  console.log("\nUninstalling editable agent-tools for Pi\n");
  await removePath(shimFile);

  console.log(`
Editable Pi uninstall complete.

Removed:

  ${shimFile}

Next step:

  restart Pi or run /reload in a running session
`);

  if (globalInstall) {
    ok("Removed global Pi editable install");
  } else {
    ok("Removed project-local Pi editable install");
  }
}

main().catch(err => {
  fail(err.message);
  process.exit(1);
});
