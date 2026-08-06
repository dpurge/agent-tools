import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();

function run(script, args = [], env = process.env) {
  return spawnSync(process.execPath, [path.join(ROOT, "scripts", script), ...args], {
    encoding: "utf8",
    env,
  });
}

async function lstatType(file) {
  const stat = await fs.lstat(file);
  return stat.isSymbolicLink() ? "symlink" : stat.isFile() ? "file" : stat.isDirectory() ? "dir" : "other";
}

test("editable Pi install creates a global shim extension pointing at the repo adapter", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-pi-home-"));
  const env = { ...process.env, PI_CODING_AGENT_DIR: path.join(tempHome, "agent") };

  const result = run("install-editable-pi.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const shim = path.join(env.PI_CODING_AGENT_DIR, "extensions", "agent-tools.ts");
  assert.equal(await lstatType(shim), "file");
  const content = await fs.readFile(shim, "utf8");
  assert.match(content, /adapters\/pi\/index\.js/);

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable Claude install creates symlinks into core and CLAUDE.md", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-editable-claude-"));

  const result = run("install-editable-claude.js", [`--target=${temp}`, "--force"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  assert.equal(await lstatType(path.join(temp, ".claude", "commands")), "symlink");
  assert.equal(await lstatType(path.join(temp, ".claude", "skills")), "symlink");
  assert.equal(await lstatType(path.join(temp, "CLAUDE.md")), "file");

  await fs.rm(temp, { recursive: true, force: true });
});

test("editable OpenCode install creates symlinks into core", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-editable-opencode-"));

  const result = run("install-editable-opencode.js", [`--target=${temp}`, "--force"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  assert.equal(await lstatType(path.join(temp, ".opencode", "commands")), "symlink");
  assert.equal(await lstatType(path.join(temp, ".opencode", "skills")), "symlink");
  assert.equal(await lstatType(path.join(temp, ".opencode", "plugins", "agent-tools", "index.js")), "file");
  assert.equal(await lstatType(path.join(temp, ".opencode", "opencode.json")), "file");

  const config = JSON.parse(await fs.readFile(path.join(temp, ".opencode", "opencode.json"), "utf8"));
  assert.equal(config.plugin.includes("./plugins/agent-tools"), true);

  await fs.rm(temp, { recursive: true, force: true });
});

test("CLI install-editable pi routes to the editable installer", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-cli-editable-pi-"));
  const env = { ...process.env, PI_CODING_AGENT_DIR: path.join(tempHome, "agent") };

  const result = run("cli.js", ["install-editable", "pi", "--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(
    await lstatType(path.join(env.PI_CODING_AGENT_DIR, "extensions", "agent-tools.ts")),
    "file"
  );

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable Pi uninstall removes the global shim", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-uninstall-pi-"));
  const env = { ...process.env, PI_CODING_AGENT_DIR: path.join(tempHome, "agent") };

  let result = run("install-editable-pi.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = run("uninstall-editable-pi.js", [], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  await assert.rejects(fs.lstat(path.join(env.PI_CODING_AGENT_DIR, "extensions", "agent-tools.ts")));

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable Claude uninstall removes symlinks and CLAUDE.md", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-uninstall-claude-"));

  let result = run("install-editable-claude.js", [`--target=${temp}`, "--force"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = run("uninstall-editable-claude.js", [`--target=${temp}`]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  await assert.rejects(fs.lstat(path.join(temp, ".claude", "commands")));
  await assert.rejects(fs.lstat(path.join(temp, "CLAUDE.md")));

  await fs.rm(temp, { recursive: true, force: true });
});

test("editable OpenCode uninstall removes symlinks and plugin config entry", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-uninstall-opencode-"));

  let result = run("install-editable-opencode.js", [`--target=${temp}`, "--force"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = run("uninstall-editable-opencode.js", [`--target=${temp}`]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  await assert.rejects(fs.lstat(path.join(temp, ".opencode", "commands")));
  await assert.rejects(fs.lstat(path.join(temp, ".opencode", "plugins", "agent-tools")));

  const config = JSON.parse(await fs.readFile(path.join(temp, ".opencode", "opencode.json"), "utf8"));
  assert.equal(Array.isArray(config.plugin) ? config.plugin.includes("./plugins/agent-tools") : false, false);

  await fs.rm(temp, { recursive: true, force: true });
});

test("CLI uninstall-editable pi routes to the editable uninstaller", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-cli-uninstall-pi-"));
  const env = { ...process.env, PI_CODING_AGENT_DIR: path.join(tempHome, "agent") };

  let result = run("cli.js", ["install-editable", "pi", "--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = run("cli.js", ["uninstall-editable", "pi"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  await assert.rejects(fs.lstat(path.join(env.PI_CODING_AGENT_DIR, "extensions", "agent-tools.ts")));

  await fs.rm(tempHome, { recursive: true, force: true });
});
