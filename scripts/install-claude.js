#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  copyDir,
  ensureDir,
  fail,
  installManifestComponents,
  ok,
  parseInstallerArgs,
  readJson,
  readManifest,
  writeJson,
  writeRulesDocument,
} from "./lib/install-common.js";

const { force, targetDir } = parseInstallerArgs();
const CLAUDE_DIR = path.join(targetDir, ".claude");

async function installPlugin() {
  await copyDir(
    path.join(
      ROOT,
      "packages/claude-agent-tools-plugin"
    ),
    path.join(
      CLAUDE_DIR,
      "plugins/agent-tools"
    ),
    { force }
  );

  ok(
    "Installed Claude Code plugin"
  );
}

async function installRules() {
  await writeRulesDocument(
    path.join(
      targetDir,
      "CLAUDE.md"
    ),
    { force }
  );
}

async function mergeSettings(manifest) {
  const settingsFile =
    path.join(
      CLAUDE_DIR,
      "settings.json"
    );

  const settings =
    await readJson(
      settingsFile
    );

  settings.agentTools =
    settings.agentTools ?? {};

  settings.agentTools.name =
    manifest.name;

  settings.agentTools.schemaVersion =
    manifest.schemaVersion;


  if (manifest.claude?.permissions) {
    settings.permissions = {
      ...(settings.permissions ?? {}),
      ...manifest.claude.permissions
    };
  }

  await writeJson(
    settingsFile,
    settings
  );

  ok(
    "Updated Claude settings.json"
  );
}

async function main() {
  console.log(
    "\nInstalling agent-tools for Claude Code\n"
  );

  const manifest =
    await readManifest();

  await ensureDir(CLAUDE_DIR);

  await installManifestComponents(manifest, CLAUDE_DIR, { force });
  await installPlugin();
  await installRules();
  await mergeSettings(manifest);

  console.log(
    `
Claude Code installation complete.

Installed:

  .claude/skills
  .claude/agents
  .claude/workflows
  .claude/plugins/agent-tools
  CLAUDE.md

Start Claude Code:

  claude
`
  );
}

main()
  .catch(err => {
    fail(err.message);
    process.exit(1);
  });