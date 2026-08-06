import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import yaml from "js-yaml";

export const ROOT = process.cwd();

export const COLORS = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

export function ok(message) {
  console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
}

export function warn(message) {
  console.log(`${COLORS.yellow}!${COLORS.reset} ${message}`);
}

export function fail(message) {
  console.log(`${COLORS.red}✗${COLORS.reset} ${message}`);
}

export function parseInstallerArgs(args = process.argv.slice(2)) {
  const force = args.includes("--force");
  const targetDir = args.find(arg => arg.startsWith("--target="))?.split("=")[1] ?? ROOT;
  return { force, targetDir };
}

export function parseEditableInstallerArgs(args = process.argv.slice(2)) {
  const force = args.includes("--force");
  const targetDir = args.find(arg => arg.startsWith("--target="))?.split("=")[1] ?? null;
  return { force, targetDir };
}

export async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export async function copyDir(source, destination, { force = false } = {}) {
  if (!(await exists(source))) {
    return;
  }

  await ensureDir(destination);

  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const src = path.join(source, entry.name);
    const dst = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDir(src, dst, { force });
      continue;
    }

    if (!force && (await exists(dst))) {
      warn(`Skipped existing: ${dst}`);
      continue;
    }

    await fs.copyFile(src, dst);
    ok(`Copied ${path.relative(ROOT, src)}`);
  }
}

export async function readJson(file) {
  if (!(await exists(file))) {
    return {};
  }

  const content = await fs.readFile(file, "utf8");
  if (!content.trim()) {
    return {};
  }

  return JSON.parse(content);
}

export async function writeJson(file, data) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export async function readManifest() {
  const file = path.join(ROOT, "agent-tools.yaml");

  if (!(await exists(file))) {
    throw new Error("Missing agent-tools.yaml");
  }

  return yaml.load(await fs.readFile(file, "utf8"));
}

export function componentPath(kind, name) {
  switch (kind) {
    case "skills":
      return ["core", "skills", name];
    case "agents":
      return ["core", "agents", `${name}.md`];
    case "workflows":
      return ["core", "workflows", `${name}.md`];
    case "commands":
      return ["core", "commands", `${name}.md`];
    case "rules":
      return ["core", "rules", `${name}.md`];
    default:
      throw new Error(`Unsupported component kind: ${kind}`);
  }
}

export function listedComponentDestination(kind, name) {
  return path.join(kind, ...(kind === "skills" ? [name] : [`${name}.md`]));
}

export async function installManifestComponents(manifest, destinationRoot, { force = false } = {}) {
  const componentKinds = ["skills", "agents", "workflows", "commands"];

  for (const kind of componentKinds) {
    for (const name of manifest[kind] ?? []) {
      const source = path.join(ROOT, ...componentPath(kind, name));
      const destination = path.join(destinationRoot, listedComponentDestination(kind, name));
      await copyDirOrFile(source, destination, { force });
    }
  }
}

export async function installRules(destinationRoot, { force = false } = {}) {
  const rulesDir = path.join(ROOT, "core", "rules");
  if (!(await exists(rulesDir))) {
    return;
  }

  const entries = await fs.readdir(rulesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    await copyDirOrFile(
      path.join(rulesDir, entry.name),
      path.join(destinationRoot, "rules", entry.name),
      { force }
    );
  }
}

export async function installManifestMcp(manifest, destinationRoot, { force = false } = {}) {
  for (const name of manifest.extensions?.mcp ?? []) {
    const source = path.join(ROOT, "extensions", "mcp", name);
    if (!(await exists(source))) {
      continue;
    }

    await copyDirOrFile(
      source,
      path.join(destinationRoot, "mcp", name),
      { force }
    );
  }
}

export async function buildRulesDocument() {
  const rulesDir = path.join(ROOT, "core", "rules");
  if (!(await exists(rulesDir))) {
    return "# Agent Tools Rules\n";
  }

  const files = (await fs.readdir(rulesDir))
    .filter(file => file.endsWith(".md"))
    .sort();

  let output = "# Agent Tools Rules\n\n";

  for (const file of files) {
    output += await fs.readFile(path.join(rulesDir, file), "utf8");
    output += "\n\n";
  }

  return output.trim() + "\n";
}

export async function writeRulesDocument(file, { force = false } = {}) {
  if (!force && (await exists(file))) {
    warn(`${path.basename(file)} exists, skipping`);
    return false;
  }

  await ensureDir(path.dirname(file));
  await fs.writeFile(file, await buildRulesDocument(), "utf8");
  ok(`Generated ${path.basename(file)}`);
  return true;
}

export async function copyDirOrFile(source, destination, { force = false } = {}) {
  const stat = await fs.stat(source);
  if (stat.isDirectory()) {
    await copyDir(source, destination, { force });
    return;
  }

  await ensureDir(path.dirname(destination));
  if (!force && (await exists(destination))) {
    warn(`Skipped existing: ${destination}`);
    return;
  }

  await fs.copyFile(source, destination);
  ok(`Copied ${path.relative(ROOT, source)}`);
}

export function piAgentDir() {
  return process.env.PI_CODING_AGENT_DIR || path.join(os.homedir(), ".pi", "agent");
}

export async function createSymlink(source, destination, { force = false } = {}) {
  await ensureDir(path.dirname(destination));

  if (await exists(destination)) {
    if (!force) {
      warn(`Skipped existing: ${destination}`);
      return false;
    }
    await fs.rm(destination, { recursive: true, force: true });
  }

  const stat = await fs.stat(source);
  const type = stat.isDirectory() ? (process.platform === "win32" ? "junction" : "dir") : "file";
  await fs.symlink(source, destination, type);
  ok(`Linked ${destination} -> ${source}`);
  return true;
}

export async function writeExtensionShim(file, targetModulePath, { force = false } = {}) {
  if (!force && (await exists(file))) {
    warn(`${path.basename(file)} exists, skipping`);
    return false;
  }

  await ensureDir(path.dirname(file));
  const targetUrl = pathToFileURL(targetModulePath).href;
  const content = `export { default } from ${JSON.stringify(targetUrl)};\n`;
  await fs.writeFile(file, content, "utf8");
  ok(`Generated ${path.basename(file)}`);
  return true;
}

export function ensureArrayIncludes(list, value) {
  const items = Array.isArray(list) ? [...list] : [];
  if (!items.includes(value)) {
    items.push(value);
  }
  return items;
}

export function removeArrayValue(list, value) {
  return Array.isArray(list) ? list.filter(item => item !== value) : [];
}

export async function removePath(target) {
  if (!(await exists(target))) {
    warn(`Nothing to remove: ${target}`);
    return false;
  }

  await fs.rm(target, { recursive: true, force: true });
  ok(`Removed ${target}`);
  return true;
}
