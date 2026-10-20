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
  const noHooks = args.includes("--no-hooks");
  return { force, targetDir, noHooks };
}

export function parseEditableInstallerArgs(args = process.argv.slice(2)) {
  const force = args.includes("--force");
  const targetDir = args.find(arg => arg.startsWith("--target="))?.split("=")[1] ?? null;
  const noHooks = args.includes("--no-hooks");
  return { force, targetDir, noHooks };
}

const GUARD_HOOK_FILE = "guard-targets.mjs";
const GUARD_MODULE_FILE = "target-guard.mjs";

/** Single source of the host-neutral guard logic, and the copies each host ships. */
export const GUARD_SOURCE = path.join("adapters", "shared", GUARD_MODULE_FILE);
export const GUARD_COPIES = [
  path.join("adapters", "claude-code", "hooks", GUARD_MODULE_FILE),
  path.join("packages", "pi-agent-tools-extension", GUARD_MODULE_FILE),
  path.join("packages", "opencode-agent-tools-plugin", GUARD_MODULE_FILE),
];

/** OpenCode and Pi load the guard from inside the plugin, so only the env switch turns it off. */
export function warnGuardOptOut(noHooks, host) {
  if (noHooks) {
    warn(`--no-hooks does not apply to ${host}: its target guard is part of the plugin. Set AGENT_TOOLS_GUARD=off to disable it.`);
  }
}

/** Refresh every copy of the guard module from its source. */
export async function syncGuardModule() {
  for (const copy of GUARD_COPIES) {
    await fs.copyFile(path.join(ROOT, GUARD_SOURCE), path.join(ROOT, copy));
  }
}

/**
 * Remove the agent-tools target guard from a Claude settings object (in
 * place), leaving every other hook alone. Matches on the script's file name.
 */
export function removeGuardHook(settings) {
  const entries = settings.hooks?.PreToolUse;
  if (!Array.isArray(entries)) {
    return settings;
  }

  settings.hooks.PreToolUse = entries
    .map(entry => ({
      ...entry,
      hooks: (entry.hooks ?? []).filter(hook => !String(hook.command ?? "").includes(GUARD_HOOK_FILE)),
    }))
    .filter(entry => entry.hooks.length > 0);

  if (settings.hooks.PreToolUse.length === 0) {
    delete settings.hooks.PreToolUse;
  }
  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }
  return settings;
}

/**
 * Install or remove the target guard in a Claude settings object, the same way
 * for every Claude installer. `copy: false` (editable) points at the script in
 * this checkout; `copy: true` copies it into `<claudeDir>/hooks` so the
 * install keeps working without the checkout. `noHooks` removes it instead.
 */
export async function applyGuardHook(settings, { claudeDir, copy, noHooks }) {
  if (noHooks) {
    removeGuardHook(settings);
    return false;
  }

  const source = path.join(ROOT, "adapters", "claude-code", "hooks", GUARD_HOOK_FILE);
  if (!copy) {
    addGuardHook(settings, source);
    return true;
  }

  await ensureDir(path.join(claudeDir, "hooks"));
  await fs.copyFile(source, path.join(claudeDir, "hooks", GUARD_HOOK_FILE));
  await fs.copyFile(
    path.join(path.dirname(source), GUARD_MODULE_FILE),
    path.join(claudeDir, "hooks", GUARD_MODULE_FILE),
  );
  addGuardHook(settings, `$CLAUDE_PROJECT_DIR/.claude/hooks/${GUARD_HOOK_FILE}`);
  return true;
}

/** Register the target guard as a PreToolUse Bash hook. Idempotent. */
export function addGuardHook(settings, hookFile) {
  removeGuardHook(settings);
  settings.hooks = settings.hooks ?? {};
  settings.hooks.PreToolUse = settings.hooks.PreToolUse ?? [];
  settings.hooks.PreToolUse.push({
    matcher: "Bash",
    hooks: [{ type: "command", command: `node ${JSON.stringify(hookFile)}`, timeout: 10 }],
  });
  return settings;
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

// CLAUDE.md must never become a second source of truth alongside a
// project's own AGENTS.md. So CLAUDE.md's *only* content is `@AGENTS.md` —
// Claude Code's own import syntax — and the actual portable rules content
// (core/rules/*.md) is merged into AGENTS.md instead, under a marker-bounded
// section so re-running the merge replaces just that section rather than
// duplicating it or disturbing anything else in the file.
const RULES_MARKER_START = "<!-- agent-tools:rules:start -->";
const RULES_MARKER_END = "<!-- agent-tools:rules:end -->";

// Demote every markdown heading by two levels (# -> ###, ## -> ####) so a
// rule file's own `# Coding Style` / `## General` nests correctly under the
// `## Agent Tools Rules` wrapper heading instead of colliding with it as a
// sibling top-level heading.
function demoteHeadings(markdown) {
  return markdown.replace(/^(#+)(\s)/gm, "##$1$2");
}

export async function buildRulesSection() {
  const rulesDir = path.join(ROOT, "core", "rules");
  let body = "## Agent Tools Rules\n\n";

  if (await exists(rulesDir)) {
    const files = (await fs.readdir(rulesDir))
      .filter(file => file.endsWith(".md"))
      .sort();

    for (const file of files) {
      body += demoteHeadings(await fs.readFile(path.join(rulesDir, file), "utf8"));
      body += "\n\n";
    }
  }

  body = body.trim() + "\n";
  return `${RULES_MARKER_START}\n${body}\n${RULES_MARKER_END}\n`;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Merge the portable rules section into `agentsFile`, creating it if
 * missing. Idempotent: replaces the previously-merged marker-bounded section
 * in place rather than appending a duplicate on every re-run.
 */
export async function mergeRulesIntoAgentsFile(agentsFile) {
  const section = await buildRulesSection();
  const markerRe = new RegExp(`${escapeRegExp(RULES_MARKER_START)}[\\s\\S]*?${escapeRegExp(RULES_MARKER_END)}\\n?`);

  let existing = "";
  if (await exists(agentsFile)) {
    existing = await fs.readFile(agentsFile, "utf8");
  }

  const updated = markerRe.test(existing)
    ? existing.replace(markerRe, section)
    : existing.trim().length > 0
      ? `${existing.trim()}\n\n${section}`
      : section;

  await ensureDir(path.dirname(agentsFile));
  await fs.writeFile(agentsFile, updated, "utf8");
}

/**
 * Strip the marker-bounded agent-tools rules section out of `file`, leaving
 * the rest of the file untouched. Used to uninstall a global editable
 * install, where the target (e.g. `~/.claude/CLAUDE.md`) is a real,
 * user-owned file that must not be deleted wholesale — only deleted outright
 * if the merge left nothing else behind.
 */
export async function removeRulesSectionFromFile(file) {
  if (!(await exists(file))) {
    warn(`Nothing to remove: ${file}`);
    return false;
  }

  const existing = await fs.readFile(file, "utf8");
  const markerRe = new RegExp(`\\n*${escapeRegExp(RULES_MARKER_START)}[\\s\\S]*?${escapeRegExp(RULES_MARKER_END)}\\n*`);

  if (!markerRe.test(existing)) {
    warn(`No agent-tools rules section found in: ${file}`);
    return false;
  }

  const updated = existing.replace(markerRe, "\n").trim();

  if (updated.length === 0) {
    await fs.rm(file, { force: true });
    ok(`Removed ${file}`);
  } else {
    await fs.writeFile(file, `${updated}\n`, "utf8");
    ok(`Removed agent-tools rules section from ${file}`);
  }

  return true;
}

/**
 * True when every `core/rules/*.md` file is reachable under `rulesDir` as a
 * link to the same file. Claude Code loads `~/.claude/rules/*.md` itself, so
 * merging the same text into CLAUDE.md as well would load every rule twice.
 */
export async function rulesAreLinked(rulesDir) {
  const sourceDir = path.join(ROOT, "core", "rules");
  if (!(await exists(sourceDir)) || !(await exists(rulesDir))) {
    return false;
  }

  const files = (await fs.readdir(sourceDir)).filter(file => file.endsWith(".md"));
  for (const file of files) {
    const linked = path.join(rulesDir, file);
    if (!(await exists(linked))) {
      return false;
    }
    if ((await fs.realpath(linked)) !== (await fs.realpath(path.join(sourceDir, file)))) {
      return false;
    }
  }
  return files.length > 0;
}

/**
 * Write `file` (a project's CLAUDE.md) as exactly `@AGENTS.md` — nothing
 * else — merging the portable rules content into that project's sibling
 * AGENTS.md (creating it if it doesn't exist) rather than duplicating the
 * content into CLAUDE.md itself.
 */
export async function writeRulesDocument(file, { force = false } = {}) {
  const projectDir = path.dirname(file);
  await mergeRulesIntoAgentsFile(path.join(projectDir, "AGENTS.md"));

  if (!force && (await exists(file))) {
    warn(`${path.basename(file)} exists, skipping`);
    return false;
  }

  await ensureDir(projectDir);
  await fs.writeFile(file, "@AGENTS.md\n", "utf8");
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

// Claude Code's own env var for relocating its user-level config directory
// (verified against Claude Code's own tooling, not assumed).
export function claudeHomeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
}

// OpenCode resolves its global config directory as OPENCODE_CONFIG_DIR, or
// else `<XDG_CONFIG_HOME>/opencode` (XDG_CONFIG_HOME defaulting to ~/.config).
export function opencodeHomeDir() {
  if (process.env.OPENCODE_CONFIG_DIR) {
    return process.env.OPENCODE_CONFIG_DIR;
  }

  const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  return path.join(xdgConfigHome, "opencode");
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

/**
 * Link `source`'s contents into `destination`. When `destination` doesn't
 * exist yet (or is already a symlink of ours), this is a single directory
 * symlink — the previous, simpler behavior, still correct for a dedicated
 * project-local `.claude/`. But a shared, user-scoped directory like
 * `~/.claude/skills` commonly already exists as a real directory aggregating
 * individually-symlinked entries from other sources — clobbering it with one
 * big symlink would erase all of that. In that case, merge instead: leave
 * the existing directory as-is and symlink each of `source`'s entries into
 * it individually, alongside whatever is already there.
 */
export async function linkDirectoryEntries(source, destination, { force = false } = {}) {
  if (!(await exists(source))) {
    return;
  }

  if (!(await exists(destination))) {
    await createSymlink(source, destination, { force });
    return;
  }

  const destStat = await fs.lstat(destination);
  if (destStat.isSymbolicLink()) {
    await createSymlink(source, destination, { force });
    return;
  }

  await ensureDir(destination);
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    await createSymlink(path.join(source, entry.name), path.join(destination, entry.name), { force });
  }
}

/**
 * Undo `linkDirectoryEntries`. If `destination` is itself a symlink, remove
 * it outright (mirrors the simple case above). Otherwise it's a shared,
 * merged directory: remove only the entries that are symlinks pointing
 * exactly at the matching entry under `source` — anything else in that
 * directory belongs to another source and must be left alone.
 */
export async function unlinkDirectoryEntries(source, destination) {
  if (!(await exists(destination))) {
    warn(`Nothing to remove: ${destination}`);
    return false;
  }

  const destStat = await fs.lstat(destination);
  if (destStat.isSymbolicLink()) {
    return removePath(destination);
  }

  if (!(await exists(source))) {
    return false;
  }

  const entries = await fs.readdir(source, { withFileTypes: true });
  let removedAny = false;

  for (const entry of entries) {
    const linkPath = path.join(destination, entry.name);
    if (!(await exists(linkPath))) {
      continue;
    }

    const linkStat = await fs.lstat(linkPath);
    if (!linkStat.isSymbolicLink()) {
      continue;
    }

    const resolvedTarget = path.resolve(path.dirname(linkPath), await fs.readlink(linkPath));
    if (resolvedTarget !== path.resolve(source, entry.name)) {
      continue;
    }

    await fs.rm(linkPath, { recursive: true, force: true });
    ok(`Removed ${linkPath}`);
    removedAny = true;
  }

  return removedAny;
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
