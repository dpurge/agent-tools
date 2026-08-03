#!/usr/bin/env node

//
// Assembles each platform package under packages/<name>/ from the single
// source of truth in core/ and extensions/. Committed package sources are only
// package.json, index.js and *.test.js; everything else here is generated and
// git-ignored.
//

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const PACKAGES = path.join(ROOT, "packages");

// Generated targets removed before each build. Never lists package.json,
// index.js or *.test.js so committed sources are preserved.
const GENERATED = [
  "skills",
  "agents",
  "workflows",
  "rules",
  "commands",
  "mcp",
  "plugin.json",
  "settings.json",
  "opencode.json",
  "README.md",
  "LICENSE",
];

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

// Build artifacts that must never end up in a shipped package.
const IGNORED_NAMES = new Set(["__pycache__", ".DS_Store", ".pytest_cache"]);

function ignored(name) {
  return IGNORED_NAMES.has(name) || name.endsWith(".pyc");
}

async function copyDir(source, destination) {
  if (!(await exists(source))) {
    return;
  }

  await ensureDir(destination);

  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    if (ignored(entry.name)) {
      continue;
    }

    const src = path.join(source, entry.name);
    const dst = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDir(src, dst);
    } else {
      await fs.copyFile(src, dst);
    }
  }
}

async function copyFile(source, destination) {
  if (!(await exists(source))) {
    return;
  }

  await ensureDir(path.dirname(destination));
  await fs.copyFile(source, destination);
}

async function readManifest() {
  return yaml.load(await fs.readFile(path.join(ROOT, "agent-tools.yaml"), "utf8"));
}

async function clean(packageDir) {
  for (const name of GENERATED) {
    await fs.rm(path.join(packageDir, name), { recursive: true, force: true });
  }
}

async function assembleCommon(packageDir) {
  for (const dir of ["skills", "agents", "workflows", "rules"]) {
    await copyDir(path.join(ROOT, "core", dir), path.join(packageDir, dir));
  }

  await copyDir(path.join(ROOT, "core", "commands"), path.join(packageDir, "commands"));
  await copyDir(path.join(ROOT, "extensions", "mcp"), path.join(packageDir, "mcp"));

  await copyFile(path.join(ROOT, "LICENSE"), path.join(packageDir, "LICENSE"));
  await copyFile(path.join(ROOT, "README.md"), path.join(packageDir, "README.md"));
}

async function generatePluginJson(packageDir, manifest) {
  const pkg = JSON.parse(await fs.readFile(path.join(packageDir, "package.json"), "utf8"));

  const plugin = {
    name: manifest.name,
    version: pkg.version,
    description: pkg.description,
    author: "dpurge",
  };

  await fs.writeFile(
    path.join(packageDir, "plugin.json"),
    JSON.stringify(plugin, null, 2) + "\n",
    "utf8"
  );
}

async function buildTarget(name, target, manifest) {
  const packageName = target.package.replace("@dpurge/", "");
  const packageDir = path.join(PACKAGES, packageName);

  if (!existsSync(packageDir)) {
    throw new Error(`Missing package directory for '${name}': ${packageDir}`);
  }

  console.log(`Assembling ${target.package}...`);

  await clean(packageDir);
  await assembleCommon(packageDir);

  if (name === "claude") {
    await copyFile(
      path.join(ROOT, "adapters/claude-code/settings.json"),
      path.join(packageDir, "settings.json")
    );
    await generatePluginJson(packageDir, manifest);
  } else if (name === "opencode") {
    await copyFile(
      path.join(ROOT, "adapters/opencode/opencode.json"),
      path.join(packageDir, "opencode.json")
    );
  }

  console.log(`✓ Built ${target.package}`);
}

async function main() {
  console.log("\nAssembling agent-tools packages...\n");

  const manifest = await readManifest();

  if (!manifest.targets) {
    throw new Error("No targets defined in agent-tools.yaml");
  }

  for (const [name, target] of Object.entries(manifest.targets)) {
    await buildTarget(name, target, manifest);
  }

  console.log("\nBuild complete.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
