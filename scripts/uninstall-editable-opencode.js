#!/usr/bin/env node

import path from "node:path";
import {
  ROOT,
  fail,
  parseEditableInstallerArgs,
  readJson,
  removeArrayValue,
  removePath,
  writeJson,
} from "./lib/install-common.js";

const { targetDir } = parseEditableInstallerArgs();
const projectDir = targetDir ?? ROOT;
const opencodeDir = path.join(projectDir, ".opencode");

async function main() {
  console.log("\nUninstalling editable agent-tools for OpenCode\n");

  for (const name of ["skills", "agents", "workflows", "commands", "rules"]) {
    await removePath(path.join(opencodeDir, name));
  }
  await removePath(path.join(opencodeDir, "plugins", "agent-tools"));

  const configFile = path.join(opencodeDir, "opencode.json");
  const config = await readJson(configFile);
  config.plugin = removeArrayValue(config.plugin, "./plugins/agent-tools");
  if (config.agentTools) {
    delete config.agentTools;
  }
  await writeJson(configFile, config);

  console.log(`
Editable OpenCode uninstall complete.

Removed editable links under:

  ${opencodeDir}
`);
}

main().catch(err => {
  fail(err.message);
  process.exit(1);
});
