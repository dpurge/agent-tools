#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  copyDir,
  ensureDir,
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
const PI_DIR = path.join(targetDir, ".pi");

async function installExtension() {
  const source = path.join(ROOT, "packages/pi-agent-tools-extension");
  const destination = path.join(PI_DIR, "extensions/agent-tools");

  await copyDir(source, destination, { force });
  ok("Installed Pi extension");
}

async function mergeConfig(manifest) {
  const configFile =
    path.join(
      PI_DIR,
      "config.json"
    );

  const existing =
    await readJson(
      configFile
    );

  const config = {
    ...existing
  };

  config.agentTools =
    config.agentTools ?? {};

  config.agentTools.name =
    manifest.name;

  config.agentTools.schemaVersion =
    manifest.schemaVersion;

  await writeJson(
    configFile,
    config
  );

  ok(
    "Updated Pi config"
  );
}

async function main() {
  console.log(
    "\nInstalling agent-tools for Pi\n"
  );

  const manifest =
    await readManifest();

  await ensureDir(PI_DIR);

  await installManifestComponents(manifest, PI_DIR, { force });
  await installRules(PI_DIR, { force });
  await installExtension();
  await mergeConfig(manifest);

  console.log(
    `
Pi installation complete.

Installed:

  .pi/skills
  .pi/agents
  .pi/workflows
  .pi/commands
  .pi/rules
  .pi/extensions/agent-tools
  .pi/config.json

Start Pi:

  pi
`
  );
}

main()
  .catch(err => {
    fail(err.message);
    process.exit(1);
  });