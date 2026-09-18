#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  claudeHomeDir,
  fail,
  parseEditableInstallerArgs,
  readJson,
  removePath,
  removeRulesSectionFromFile,
  unlinkDirectoryEntries,
  writeJson,
} from "./lib/install-common.js";

const { targetDir } = parseEditableInstallerArgs();
const globalInstall = !targetDir;
const claudeDir = globalInstall ? claudeHomeDir() : path.join(targetDir, ".claude");

async function main() {
  console.log(`\nUninstalling editable agent-tools for Claude Code${globalInstall ? " (global)" : ""}\n`);

  for (const name of ["skills", "agents", "workflows", "commands", "rules"]) {
    await unlinkDirectoryEntries(path.join(ROOT, "core", name), path.join(claudeDir, name));
  }

  if (globalInstall) {
    // ~/.claude/CLAUDE.md is a real, user-owned file — only strip our
    // merged section, don't delete the whole file.
    await removeRulesSectionFromFile(path.join(claudeDir, "CLAUDE.md"));
  } else {
    await removePath(path.join(targetDir, "CLAUDE.md"));
  }

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
