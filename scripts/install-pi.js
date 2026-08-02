#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();

const args = process.argv.slice(2);

const force = args.includes("--force");

const targetDir =
  args.find(a => a.startsWith("--target="))
    ?.split("=")[1]
    ?? ROOT;

const PI_DIR =
  path.join(targetDir, ".pi");

const COLORS = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  reset: "\x1b[0m"
};

function ok(message) {
  console.log(
    `${COLORS.green}✓${COLORS.reset} ${message}`
  );
}

function warn(message) {
  console.log(
    `${COLORS.yellow}!${COLORS.reset} ${message}`
  );
}

function fail(message) {
  console.log(
    `${COLORS.red}✗${COLORS.reset} ${message}`
  );
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await fs.mkdir(
    dir,
    { recursive: true }
  );
}

async function copyDir(source, destination) {
  if (!(await exists(source))) {
    return;
  }

  await ensureDir(destination);

  const entries =
    await fs.readdir(
      source,
      { withFileTypes: true }
    );

  for (const entry of entries) {
    const src =
      path.join(source, entry.name);

    const dst =
      path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDir(src, dst);
      continue;
    }

    if (!force && await exists(dst)) {
      warn(
        `Skipped existing: ${dst}`
      );
      continue;
    }

    await fs.copyFile(src, dst);

    ok(
      `Copied ${path.relative(ROOT, src)}`
    );
  }
}

async function readJson(file) {
  if (!(await exists(file))) {
    return {};
  }

  const content =
    await fs.readFile(
      file,
      "utf8"
    );

  if (!content.trim()) {
    return {};
  }

  return JSON.parse(content);
}

async function writeJson(file, data) {
  await ensureDir(
    path.dirname(file)
  );

  await fs.writeFile(
    file,
    JSON.stringify(
      data,
      null,
      2
    ) + "\n",
    "utf8"
  );
}

async function readManifest() {
  const file =
    path.join(
      ROOT,
      "agent-tools.yaml"
    );

  if (!(await exists(file))) {
    throw new Error(
      "Missing agent-tools.yaml"
    );
  }

  return yaml.load(
    await fs.readFile(
      file,
      "utf8"
    )
  );
}

async function installSkills() {
  await copyDir(
    path.join(
      ROOT,
      "core/skills"
    ),
    path.join(
      PI_DIR,
      "skills"
    )
  );
}

async function installAgents() {
  await copyDir(
    path.join(
      ROOT,
      "core/agents"
    ),
    path.join(
      PI_DIR,
      "agents"
    )
  );
}

async function installWorkflows() {
  await copyDir(
    path.join(
      ROOT,
      "core/workflows"
    ),
    path.join(
      PI_DIR,
      "workflows"
    )
  );
}

async function installRules() {
  const rulesDir =
    path.join(
      ROOT,
      "core/rules"
    );

  if (!(await exists(rulesDir))) {
    return;
  }

  await copyDir(
    rulesDir,
    path.join(
      PI_DIR,
      "rules"
    )
  );
}

async function installExtension() {
  const source =
    path.join(
      ROOT,
      "packages/pi-agent-tools-extension"
    );

  const destination =
    path.join(
      PI_DIR,
      "extensions/agent-tools"
    );

  await copyDir(
    source,
    destination
  );

  ok(
    "Installed Pi extension"
  );
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

  await ensureDir(
    PI_DIR
  );

  await installSkills();
  await installAgents();
  await installWorkflows();
  await installRules();
  await installExtension();
  await mergeConfig(manifest);

  console.log(
    `
Pi installation complete.

Installed:

  .pi/skills
  .pi/agents
  .pi/workflows
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