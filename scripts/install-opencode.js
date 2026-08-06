#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  copyDir,
  ensureArrayIncludes,
  ensureDir,
  exists,
  fail,
  installManifestComponents,
  installRules,
  ok,
  parseInstallerArgs,
  readJson,
  readManifest,
  writeJson,
} from "./lib/install-common.js";

const { force, targetDir } = parseInstallerArgs();
const OPENCODE_DIR = path.join(targetDir, ".opencode");

async function mergeConfig(manifest) {
  const configFile =
    path.join(
      OPENCODE_DIR,
      "opencode.json"
    );

  const templateFile =
    path.join(
      ROOT,
      "adapters/opencode/opencode.json"
    );

  let config = {};

  if (await exists(templateFile)) {
    config =
      await readJson(templateFile);
  }

  if (await exists(configFile)) {
    const existing =
      await readJson(configFile);

    config = {
      ...config,
      ...existing
    };
  }

  config.agentTools =
    config.agentTools ?? {};

  config.agentTools.name =
    manifest.name;

  config.agentTools.schemaVersion =
    manifest.schemaVersion;

  config.plugin = ensureArrayIncludes(config.plugin, "./plugins/agent-tools");

  await writeJson(
    configFile,
    config
  );

  ok(
    "Updated OpenCode config"
  );
}

async function installPlugin() {
  const source =
    path.join(
      ROOT,
      "packages/opencode-agent-tools-plugin"
    );

  const destination =
    path.join(
      OPENCODE_DIR,
      "plugins/agent-tools"
    );

  await copyDir(
    source,
    destination,
    { force }
  );

  ok(
    "Installed OpenCode plugin"
  );
}

async function main() {
  console.log(
    "\nInstalling agent-tools for OpenCode\n"
  );

  const manifest =
    await readManifest();

  await ensureDir(OPENCODE_DIR);

  await installManifestComponents(manifest, OPENCODE_DIR, { force });
  await installRules(OPENCODE_DIR, { force });
  await installPlugin();
  await mergeConfig(manifest);

  console.log(
    `
OpenCode installation complete.

Installed:

  .opencode/skills
  .opencode/agents
  .opencode/workflows
  .opencode/commands
  .opencode/rules
  .opencode/plugins/agent-tools
  .opencode/opencode.json

Start OpenCode:

  opencode
`
  );
}

main()
  .catch(err => {
    fail(err.message);
    process.exit(1);
  });