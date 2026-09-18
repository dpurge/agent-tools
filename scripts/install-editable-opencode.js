#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  ensureArrayIncludes,
  ensureDir,
  fail,
  linkDirectoryEntries,
  ok,
  opencodeHomeDir,
  parseEditableInstallerArgs,
  readJson,
  writeExtensionShim,
  writeJson,
} from "./lib/install-common.js";

const { force, targetDir } = parseEditableInstallerArgs();
const globalInstall = !targetDir;
const opencodeDir = globalInstall ? opencodeHomeDir() : path.join(targetDir, ".opencode");

async function mergeConfig() {
  const configFile = path.join(opencodeDir, "opencode.json");
  const settings = await readJson(configFile);

  settings.agentTools = settings.agentTools ?? {};
  settings.agentTools.enabled = true;
  settings.agentTools.loadSkills = true;
  settings.agentTools.loadAgents = true;
  settings.agentTools.loadWorkflows = true;
  settings.plugin = ensureArrayIncludes(settings.plugin, "./plugins/agent-tools");

  await writeJson(configFile, settings);
  ok("Updated OpenCode config");
}

async function main() {
  console.log(`\nInstalling editable agent-tools for OpenCode${globalInstall ? " (global)" : ""}\n`);

  await ensureDir(opencodeDir);

  for (const dir of ["skills", "agents", "workflows", "commands", "rules"]) {
    await linkDirectoryEntries(path.join(ROOT, "core", dir), path.join(opencodeDir, dir), { force });
  }

  await writeExtensionShim(
    path.join(opencodeDir, "plugins", "agent-tools", "index.js"),
    path.join(ROOT, "adapters", "opencode", "index.js"),
    { force }
  );

  await mergeConfig();

  console.log(`
Editable OpenCode installation complete.

Installed symlinks under:

  ${opencodeDir}

Source repo:

  ${ROOT}

Behavior:

  - OpenCode reads commands/skills/agents/workflows from this checkout
  - changes to core/ are visible without reinstalling
  - restart OpenCode if a running session does not pick up changes

Note:

  OpenCode slash-command discovery may depend on host behavior. This editable
  install links .opencode/commands directly to core/commands, but if commands
  still do not appear automatically we should add explicit runtime registration
  in an OpenCode plugin as a follow-up.
`);

  if (globalInstall) {
    ok("Installed globally for all OpenCode sessions");
  } else {
    ok("Installed project-locally for this OpenCode workspace");
  }
}

main().catch(err => {
  fail(err.message);
  process.exit(1);
});
