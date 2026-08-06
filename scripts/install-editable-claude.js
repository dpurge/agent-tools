#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  createSymlink,
  ensureDir,
  fail,
  ok,
  parseEditableInstallerArgs,
  readJson,
  writeJson,
  writeRulesDocument,
} from "./lib/install-common.js";

const { force, targetDir } = parseEditableInstallerArgs();
const projectDir = targetDir ?? ROOT;
const claudeDir = path.join(projectDir, ".claude");

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
  console.log("\nInstalling editable agent-tools for Claude Code\n");

  await ensureDir(claudeDir);

  for (const dir of ["skills", "agents", "workflows", "commands", "rules"]) {
    await createSymlink(path.join(ROOT, "core", dir), path.join(claudeDir, dir), { force });
  }

  await writeRulesDocument(path.join(projectDir, "CLAUDE.md"), { force });
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
}

main().catch(err => {
  fail(err.message);
  process.exit(1);
});
