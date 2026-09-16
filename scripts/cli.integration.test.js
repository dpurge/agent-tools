import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();

function runCli(args, cwd = ROOT) {
  return spawnSync(process.execPath, [path.join(ROOT, "scripts", "cli.js"), ...args], {
    cwd,
    encoding: "utf8",
  });
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

test("cli install pi installs into a temp target and wires config", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-cli-pi-"));

  const result = runCli(["install", "pi", "--force", "--target-dir", temp]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  assert.equal(await exists(path.join(temp, ".pi", "skills", "code-review", "SKILL.md")), true);
  assert.equal(await exists(path.join(temp, ".pi", "commands", "research.md")), true);
  assert.equal(await exists(path.join(temp, ".pi", "extensions", "agent-tools", "index.js")), true);
  assert.equal(await exists(path.join(temp, ".pi", "prompts")), false);

  const config = JSON.parse(await fs.readFile(path.join(temp, ".pi", "config.json"), "utf8"));
  assert.equal(config.agentTools?.name, "agent-tools");
  assert.equal(config.agentTools?.schemaVersion, 1);

  await fs.rm(temp, { recursive: true, force: true });
});

test("cli install claude installs into a temp target and generates CLAUDE.md", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-cli-claude-"));

  const result = runCli(["install", "claude", "--force", "--target-dir", temp]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  assert.equal(await exists(path.join(temp, ".claude", "skills", "code-review", "SKILL.md")), true);
  assert.equal(await exists(path.join(temp, ".claude", "plugins", "agent-tools", "plugin.json")), true);
  assert.equal(await exists(path.join(temp, "CLAUDE.md")), true);

  const claudeMd = await fs.readFile(path.join(temp, "CLAUDE.md"), "utf8");
  assert.equal(claudeMd, "@AGENTS.md\n");

  const agentsMd = await fs.readFile(path.join(temp, "AGENTS.md"), "utf8");
  assert.match(agentsMd, /## Agent Tools Rules/);

  await fs.rm(temp, { recursive: true, force: true });
});

test("cli install opencode wires the plugin entry in config", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-cli-opencode-"));

  const result = runCli(["install", "opencode", "--force", "--target-dir", temp]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const config = JSON.parse(await fs.readFile(path.join(temp, ".opencode", "opencode.json"), "utf8"));
  assert.equal(config.plugin.includes("./plugins/agent-tools"), true);
  assert.equal(await exists(path.join(temp, ".opencode", "plugins", "agent-tools", "index.js")), true);

  await fs.rm(temp, { recursive: true, force: true });
});

test("build output excludes non-packaged top-level source directories like prompts", async () => {
  const result = runCli(["build"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  assert.equal(await exists(path.join(ROOT, "packages", "pi-agent-tools-extension", "prompts")), false);
  assert.equal(await exists(path.join(ROOT, "packages", "claude-agent-tools-plugin", "prompts")), false);
  assert.equal(await exists(path.join(ROOT, "packages", "opencode-agent-tools-plugin", "prompts")), false);
});
