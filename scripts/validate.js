#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";
import matter from "front-matter";

const ROOT = process.cwd();

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m"
};

let errors = [];
let warnings = [];

function error(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function ok(message) {
  console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
}

function fail(message) {
  console.log(`${COLORS.red}✗${COLORS.reset} ${message}`);
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readYaml(file) {
  return yaml.load(await fs.readFile(file, "utf8"));
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function listDirs(dir) {
  if (!(await exists(dir))) {
    return [];
  }
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

async function listFiles(dir, extension) {
  if (!(await exists(dir))) {
    return [];
  }
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && (!extension || e.name.endsWith(extension)))
    .map(e => e.name);
}

async function validateManifest() {
  const file = path.join(ROOT, "agent-tools.yaml");

  if (!(await exists(file))) {
    error("Missing agent-tools.yaml");
    return null;
  }

  const config = await readYaml(file);

  if (!config.schemaVersion) {
    error("agent-tools.yaml missing schemaVersion");
  }

  if (!config.name) {
    error("agent-tools.yaml missing name");
  }

  ok("agent-tools.yaml loaded");

  return config;
}

async function validateDirectories() {
  const required = [
    "core/skills",
    "core/agents",
    "core/workflows",
    "core/rules",
    "adapters",
    "packages"
  ];

  for (const dir of required) {
    if (!(await exists(path.join(ROOT, dir)))) {
      error(`Missing directory: ${dir}`);
    } else {
      ok(`Found ${dir}`);
    }
  }
}

async function validateSkills() {
  const dir = path.join(ROOT, "core/skills");

  for (const skill of await listDirs(dir)) {
    const file = path.join(dir, skill, "SKILL.md");

    if (!(await exists(file))) {
      error(`Skill '${skill}' missing SKILL.md`);
      continue;
    }

    try {
      const parsed = matter(await fs.readFile(file, "utf8"));

      if (!parsed.attributes.name) {
        warn(`Skill '${skill}' missing name`);
      }
      if (!parsed.attributes.description) {
        warn(`Skill '${skill}' missing description`);
      }

      ok(`Skill validated: ${skill}`);
    } catch (e) {
      error(`Invalid skill '${skill}': ${e.message}`);
    }
  }
}

async function validateAgents() {
  const dir = path.join(ROOT, "core/agents");

  for (const file of await listFiles(dir, ".md")) {
    try {
      const parsed = matter(await fs.readFile(path.join(dir, file), "utf8"));
      const { name, description, tools, permissions } = parsed.attributes;

      if (!name) {
        warn(`Agent '${file}' missing name`);
      }
      if (!description) {
        warn(`Agent '${file}' missing description`);
      }
      if (!Array.isArray(tools) || tools.length === 0) {
        warn(`Agent '${file}' does not declare 'tools'`);
      }
      if (!permissions || typeof permissions !== "object") {
        warn(`Agent '${file}' does not declare 'permissions'`);
      }

      ok(`Agent validated: ${file}`);
    } catch (e) {
      error(`Invalid agent '${file}': ${e.message}`);
    }
  }
}

async function validateWorkflows(agents, skills) {
  const dir = path.join(ROOT, "core/workflows");

  for (const file of await listFiles(dir, ".md")) {
    let parsed;
    try {
      parsed = matter(await fs.readFile(path.join(dir, file), "utf8"));
    } catch (e) {
      error(`Invalid workflow '${file}': ${e.message}`);
      continue;
    }

    for (const agent of parsed.attributes.agents ?? []) {
      if (!agents.has(agent)) {
        error(`Workflow '${file}' references unknown agent '${agent}'`);
      }
    }

    for (const skill of parsed.attributes.skills ?? []) {
      if (!skills.has(skill)) {
        error(`Workflow '${file}' references unknown skill '${skill}'`);
      }
    }

    ok(`Workflow validated: ${file}`);
  }
}

//
// Every skill / agent / workflow / command listed in the manifest must exist
// as a file. Catches drift between agent-tools.yaml and core/.
//
async function validateManifestReferences(config) {
  const checks = [
    ["skills", config.skills, name => path.join(ROOT, "core/skills", name, "SKILL.md")],
    ["agents", config.agents, name => path.join(ROOT, "core/agents", `${name}.md`)],
    ["workflows", config.workflows, name => path.join(ROOT, "core/workflows", `${name}.md`)],
    ["commands", config.commands, name => path.join(ROOT, "core/commands", `${name}.md`)]
  ];

  for (const [kind, list, resolve] of checks) {
    for (const name of list ?? []) {
      if (!(await exists(resolve(name)))) {
        error(`Manifest lists ${kind} '${name}' but ${path.relative(ROOT, resolve(name))} is missing`);
      } else {
        ok(`Manifest ${kind} present: ${name}`);
      }
    }
  }
}

async function validateTargets(config) {
  if (!config?.targets) {
    warn("No targets defined");
    return;
  }

  for (const [name, target] of Object.entries(config.targets)) {
    if (!target.adapter) {
      error(`Target '${name}' has no adapter`);
    } else if (!(await exists(path.join(ROOT, target.adapter)))) {
      error(`Adapter missing for '${name}': ${target.adapter}`);
    } else {
      ok(`Adapter found: ${name}`);
    }

    if (!target.package) {
      error(`Target '${name}' has no package`);
      continue;
    }

    const packageDir = path.join(ROOT, "packages", target.package.replace("@dpurge/", ""));

    if (!(await exists(packageDir))) {
      error(`Package directory missing for '${name}': ${packageDir}`);
      continue;
    }

    const packageJson = path.join(packageDir, "package.json");

    if (!(await exists(packageJson))) {
      error(`Missing package.json: ${packageJson}`);
      continue;
    }

    const pkg = await readJson(packageJson);

    if (pkg.name !== target.package) {
      error(`Package name mismatch: expected ${target.package}, found ${pkg.name}`);
    } else {
      ok(`Package validated: ${target.package}`);
    }

    // The entry point (main) must actually exist so `npm pack` / imports work.
    const entry = pkg.main ?? "index.js";
    if (!(await exists(path.join(packageDir, entry)))) {
      error(`Package '${target.package}' entry '${entry}' does not exist`);
    } else {
      ok(`Package entry present: ${target.package} -> ${entry}`);
    }
  }
}

async function main() {
  console.log("\nValidating agent-tools...\n");

  const manifest = await validateManifest();

  await validateDirectories();
  await validateSkills();
  await validateAgents();

  const agents = new Set(
    (await listFiles(path.join(ROOT, "core/agents"), ".md")).map(f => f.replace(".md", ""))
  );
  const skills = new Set(await listDirs(path.join(ROOT, "core/skills")));

  await validateWorkflows(agents, skills);

  if (manifest) {
    await validateManifestReferences(manifest);
    await validateTargets(manifest);
  }

  console.log("");

  warnings.forEach(w => console.log(`${COLORS.yellow}!${COLORS.reset} ${w}`));
  errors.forEach(e => fail(e));

  console.log("");

  if (errors.length) {
    console.log(`${COLORS.red}Validation failed${COLORS.reset}: ${errors.length} error(s)`);
    process.exit(1);
  }

  console.log(`${COLORS.green}Validation successful${COLORS.reset}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
