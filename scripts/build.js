#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();

const DIST = path.join(ROOT, "dist");
const PACKAGES = path.join(ROOT, "packages");

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

async function copyDir(source, destination) {
  if (!(await exists(source))) {
    return;
  }

  await ensureDir(destination);

  const entries = await fs.readdir(
    source,
    { withFileTypes: true }
  );

  for (const entry of entries) {
    const src = path.join(source, entry.name);
    const dst = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDir(src, dst);
    } else {
      await fs.copyFile(src, dst);
    }
  }
}

async function readManifest() {
  const file =
    path.join(ROOT, "agent-tools.yaml");

  return yaml.load(
    await fs.readFile(file, "utf8")
  );
}

async function buildTarget(name, target) {
  console.log(`Building ${name}...`);

  const packageName =
    target.package.replace(
      "@dpurge/",
      ""
    );

  const packageDir =
    path.join(
      PACKAGES,
      packageName
    );

  const output =
    path.join(
      DIST,
      name
    );

  await ensureDir(output);

  //
  // Portable assets
  //
  await copyDir(
    path.join(ROOT, "core/skills"),
    path.join(output, "skills")
  );

  await copyDir(
    path.join(ROOT, "core/agents"),
    path.join(output, "agents")
  );

  await copyDir(
    path.join(ROOT, "core/workflows"),
    path.join(output, "workflows")
  );

  await copyDir(
    path.join(ROOT, "core/rules"),
    path.join(output, "rules")
  );

  //
  // Adapter files
  //
  await copyDir(
    path.join(ROOT, target.adapter),
    path.join(output, "adapter")
  );

  //
  // Package metadata
  //
  await copyDir(
    packageDir,
    path.join(output, "package")
  );

  console.log(
    `✓ Built ${name}`
  );
}

async function main() {
  console.log(
    "\nBuilding agent-tools...\n"
  );

  const manifest =
    await readManifest();

  if (!manifest.targets) {
    throw new Error(
      "No targets defined in agent-tools.yaml"
    );
  }

  await fs.rm(
    DIST,
    {
      recursive: true,
      force: true
    }
  );

  await ensureDir(DIST);

  for (const [name, target] of Object.entries(
    manifest.targets
  )) {
    await buildTarget(
      name,
      target
    );
  }

  console.log(
    "\nBuild complete."
  );
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  });