#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  fail,
  parseEditableInstallerArgs,
  readJson,
  removePath,
  writeJson,
} from "./lib/install-common.js";

const { targetDir } = parseEditableInstallerArgs();
const projectDir = targetDir ?? ROOT;
const claudeDir = path.join(projectDir, ".claude");

async function main() {
  console.log("\nUninstalling editable agent-tools for Claude Code\n");

  for (const name of ["skills", "agents", "workflows", "commands", "rules"]) {
    await removePath(path.join(claudeDir, name));
  }
  await removePath(path.join(projectDir, "CLAUDE.md"));

  const settingsFile = path.join(claudeDir, "settings.json");
  const settings = await readJson(settingsFile);
  if (settings.agentTools) {
    delete settings.agentTools;
    await writeJson(settingsFile, settings);
  }

  console.log(`
Editable Claude uninstall complete.

Removed editable links under:

  ${claudeDir}
`);
}

main().catch(err => {
  fail(err.message);
  process.exit(1);
});
