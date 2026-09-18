#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  claudeHomeDir,
  ensureDir,
  fail,
  linkDirectoryEntries,
  mergeRulesIntoAgentsFile,
  ok,
  parseEditableInstallerArgs,
  readJson,
  writeJson,
  writeRulesDocument,
} from "./lib/install-common.js";

const { force, targetDir } = parseEditableInstallerArgs();
const globalInstall = !targetDir;
const claudeDir = globalInstall ? claudeHomeDir() : path.join(targetDir, ".claude");

async function mergeSettings() {
  const settingsFile = path.join(claudeDir, "settings.json");
  const settings = await readJson(settingsFile);

  settings.agentTools = settings.agentTools ?? {};
  settings.agentTools.enabled = true;
  settings.agentTools.loadSkills = true;
  settings.agentTools.loadAgents = true;
  settings.agentTools.loadWorkflows = true;

  await writeJson(settingsFile, settings);
  ok("Updated Claude settings.json");
}

async function main() {
  console.log(`\nInstalling editable agent-tools for Claude Code${globalInstall ? " (global)" : ""}\n`);

  await ensureDir(claudeDir);

  for (const dir of ["skills", "agents", "workflows", "commands", "rules"]) {
    await linkDirectoryEntries(path.join(ROOT, "core", dir), path.join(claudeDir, dir), { force });
  }

  if (globalInstall) {
    // No project root to hold a sibling AGENTS.md at user scope, so the
    // rules section is merged directly into the global CLAUDE.md instead of
    // the project-local `@AGENTS.md` indirection writeRulesDocument uses.
    await mergeRulesIntoAgentsFile(path.join(claudeDir, "CLAUDE.md"));
  } else {
    await writeRulesDocument(path.join(targetDir, "CLAUDE.md"), { force });
  }

  await mergeSettings();

  console.log(`
Editable Claude installation complete.

Installed symlinks under:

  ${claudeDir}

Source repo:

  ${ROOT}

Behavior:

  - Claude reads commands/skills/agents/workflows from this checkout
  - changes to core/ are visible without reinstalling
  - restart Claude Code if a running session does not pick up changes
`);

  if (globalInstall) {
    ok("Installed globally for all Claude Code sessions");
  } else {
    ok("Installed project-locally for this project");
  }
}

main().catch(err => {
  fail(err.message);
  process.exit(1);
});
