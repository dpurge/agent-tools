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

const CLAUDE_DIR =
  path.join(targetDir, ".claude");

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
      CLAUDE_DIR,
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
      CLAUDE_DIR,
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
      CLAUDE_DIR,
      "workflows"
    )
  );
}

async function installCommands() {
  await copyDir(
    path.join(
      ROOT,
      "adapters/claude-code/templates/commands"
    ),
    path.join(
      CLAUDE_DIR,
      "commands"
    )
  );
}

async function installPlugin() {
  await copyDir(
    path.join(
      ROOT,
      "packages/claude-agent-tools-plugin"
    ),
    path.join(
      CLAUDE_DIR,
      "plugins/agent-tools"
    )
  );

  ok(
    "Installed Claude Code plugin"
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

  let output =
    "# Agent Tools Rules\n\n";

  const files =
    await fs.readdir(
      rulesDir
    );

  for (const file of files) {
    if (!file.endsWith(".md")) {
      continue;
    }

    output +=
      await fs.readFile(
        path.join(
          rulesDir,
          file
        ),
        "utf8"
      );

    output += "\n\n";
  }

  const claudeFile =
    path.join(
      targetDir,
      "CLAUDE.md"
    );

  if (!force && await exists(claudeFile)) {
    warn(
      "CLAUDE.md exists, skipping"
    );
    return;
  }

  await fs.writeFile(
    claudeFile,
    output.trim() + "\n",
    "utf8"
  );

  ok(
    "Generated CLAUDE.md"
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

  await ensureDir(
    CLAUDE_DIR
  );

  await installSkills();
  await installAgents();
  await installWorkflows();
  await installCommands();
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