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

test("editable Claude install with no --target installs globally to CLAUDE_CONFIG_DIR", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-home-"));
  const env = { ...process.env, CLAUDE_CONFIG_DIR: path.join(tempHome, "claude") };

  const result = run("install-editable-claude.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  assert.equal(await lstatType(path.join(env.CLAUDE_CONFIG_DIR, "commands")), "symlink");
  assert.equal(await lstatType(path.join(env.CLAUDE_CONFIG_DIR, "rules")), "symlink");
  // The linked rules/ directory is loaded by Claude Code itself, so no copy
  // of the rules is merged into CLAUDE.md (that would load them twice).
  await assert.rejects(fs.lstat(path.join(env.CLAUDE_CONFIG_DIR, "CLAUDE.md")));

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable Claude global install removes a stale merged rules block and keeps the user's own notes", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-home-stale-"));
  const env = { ...process.env, CLAUDE_CONFIG_DIR: path.join(tempHome, "claude") };
  const claudeMd = path.join(env.CLAUDE_CONFIG_DIR, "CLAUDE.md");

  await fs.mkdir(env.CLAUDE_CONFIG_DIR, { recursive: true });
  await fs.writeFile(
    claudeMd,
    "# My own notes\n\n<!-- agent-tools:rules:start -->\nstale copy\n<!-- agent-tools:rules:end -->\n",
    "utf8",
  );

  const result = run("install-editable-claude.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const content = await fs.readFile(claudeMd, "utf8");
  assert.match(content, /My own notes/);
  assert.doesNotMatch(content, /agent-tools:rules:start/);

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable Claude global install falls back to merging rules when rules/ cannot be linked", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-home-fallback-"));
  const env = { ...process.env, CLAUDE_CONFIG_DIR: path.join(tempHome, "claude") };

  // A real file with a rule's name makes the install skip that link (no
  // --force), so the rules would otherwise be missing from the session.
  await fs.mkdir(path.join(env.CLAUDE_CONFIG_DIR, "rules"), { recursive: true });
  await fs.writeFile(path.join(env.CLAUDE_CONFIG_DIR, "rules", "operations.md"), "my own rule\n", "utf8");

  const result = run("install-editable-claude.js", [], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const content = await fs.readFile(path.join(env.CLAUDE_CONFIG_DIR, "CLAUDE.md"), "utf8");
  assert.match(content, /agent-tools:rules:start/);

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable Claude global uninstall strips the rules section but keeps the user's own CLAUDE.md content", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-home-uninstall-"));
  const env = { ...process.env, CLAUDE_CONFIG_DIR: path.join(tempHome, "claude") };

  let result = run("install-editable-claude.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const claudeMd = path.join(env.CLAUDE_CONFIG_DIR, "CLAUDE.md");
  await fs.writeFile(
    claudeMd,
    "# My own notes\n\n<!-- agent-tools:rules:start -->\nmerged copy\n<!-- agent-tools:rules:end -->\n",
    "utf8",
  );

  result = run("uninstall-editable-claude.js", [], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  await assert.rejects(fs.lstat(path.join(env.CLAUDE_CONFIG_DIR, "commands")));
  const remaining = await fs.readFile(claudeMd, "utf8");
  assert.match(remaining, /My own notes/);
  assert.doesNotMatch(remaining, /agent-tools:rules:start/);

  await fs.rm(tempHome, { recursive: true, force: true });
});

async function readSettings(configDir) {
  return JSON.parse(await fs.readFile(path.join(configDir, "settings.json"), "utf8"));
}

test("editable Claude global install registers the target guard once, and --no-hooks leaves it out", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-home-hook-"));
  const env = { ...process.env, CLAUDE_CONFIG_DIR: path.join(tempHome, "claude") };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = run("install-editable-claude.js", ["--force"], env);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }

  const entries = (await readSettings(env.CLAUDE_CONFIG_DIR)).hooks.PreToolUse;
  assert.equal(entries.length, 1, "re-running must not duplicate the hook");
  assert.equal(entries[0].matcher, "Bash");
  assert.match(entries[0].hooks[0].command, /adapters\/claude-code\/hooks\/guard-targets\.mjs/);
  const stop = (await readSettings(env.CLAUDE_CONFIG_DIR)).hooks.Stop;
  assert.equal(stop.length, 1, "re-running must not duplicate the closeout hook");
  assert.equal(stop[0].matcher, undefined);
  assert.match(stop[0].hooks[0].command, /adapters\/claude-code\/hooks\/closeout-guard\.mjs/);

  const result = run("install-editable-claude.js", ["--force", "--no-hooks"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal((await readSettings(env.CLAUDE_CONFIG_DIR)).hooks, undefined);

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable Claude project-local install registers the target guard like the global one", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-editable-claude-nohook-"));

  const result = run("install-editable-claude.js", [`--target=${temp}`, "--force"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const entries = (await readSettings(path.join(temp, ".claude"))).hooks.PreToolUse;
  assert.equal(entries.length, 1);
  assert.match(entries[0].hooks[0].command, /guard-targets\.mjs/);
  const stop = (await readSettings(path.join(temp, ".claude"))).hooks.Stop;
  assert.match(stop[0].hooks[0].command, /closeout-guard\.mjs/);

  await fs.rm(temp, { recursive: true, force: true });
});

test("editable Claude global uninstall removes only the target guard and keeps the user's other hooks", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-home-hook-uninstall-"));
  const env = { ...process.env, CLAUDE_CONFIG_DIR: path.join(tempHome, "claude") };
  const settingsFile = path.join(env.CLAUDE_CONFIG_DIR, "settings.json");

  await fs.mkdir(env.CLAUDE_CONFIG_DIR, { recursive: true });
  const own = { matcher: "Bash", hooks: [{ type: "command", command: "echo mine" }] };
  const ownStop = { hooks: [{ type: "command", command: "echo mine too" }] };
  await fs.writeFile(settingsFile, JSON.stringify({ hooks: { PreToolUse: [own], Stop: [ownStop] } }), "utf8");

  let result = run("install-editable-claude.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal((await readSettings(env.CLAUDE_CONFIG_DIR)).hooks.PreToolUse.length, 2);
  assert.equal((await readSettings(env.CLAUDE_CONFIG_DIR)).hooks.Stop.length, 2);

  result = run("uninstall-editable-claude.js", [], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual((await readSettings(env.CLAUDE_CONFIG_DIR)).hooks, { PreToolUse: [own], Stop: [ownStop] });

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable OpenCode install with no --target installs globally to OPENCODE_CONFIG_DIR", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-opencode-home-"));
  const env = { ...process.env, OPENCODE_CONFIG_DIR: path.join(tempHome, "opencode") };

  const result = run("install-editable-opencode.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  assert.equal(await lstatType(path.join(env.OPENCODE_CONFIG_DIR, "commands")), "symlink");
  assert.equal(await lstatType(path.join(env.OPENCODE_CONFIG_DIR, "plugins", "agent-tools", "index.js")), "file");

  const config = JSON.parse(await fs.readFile(path.join(env.OPENCODE_CONFIG_DIR, "opencode.json"), "utf8"));
  assert.equal(config.plugin.includes("./plugins/agent-tools"), true);

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable OpenCode global uninstall removes symlinks and plugin config entry", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-opencode-home-uninstall-"));
  const env = { ...process.env, OPENCODE_CONFIG_DIR: path.join(tempHome, "opencode") };

  let result = run("install-editable-opencode.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = run("uninstall-editable-opencode.js", [], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  await assert.rejects(fs.lstat(path.join(env.OPENCODE_CONFIG_DIR, "commands")));
  await assert.rejects(fs.lstat(path.join(env.OPENCODE_CONFIG_DIR, "plugins", "agent-tools")));

  await fs.rm(tempHome, { recursive: true, force: true });
});

test("editable Claude global install merges into a pre-existing skills/agents dir without touching other entries", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-merge-"));
  const env = { ...process.env, CLAUDE_CONFIG_DIR: path.join(tempHome, "claude") };

  // Simulate a global ~/.claude/skills that already aggregates an unrelated
  // skill symlinked in from some other source, same shape a real user's
  // config would have.
  const foreignSkillTarget = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-foreign-skill-"));
  await fs.writeFile(path.join(foreignSkillTarget, "SKILL.md"), "# foreign\n", "utf8");
  await fs.mkdir(path.join(env.CLAUDE_CONFIG_DIR, "skills"), { recursive: true });
  await fs.symlink(
    foreignSkillTarget,
    path.join(env.CLAUDE_CONFIG_DIR, "skills", "some-other-skill"),
    "dir"
  );

  const result = run("install-editable-claude.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  // Destination stays a real directory (not replaced by one big symlink)...
  assert.equal(await lstatType(path.join(env.CLAUDE_CONFIG_DIR, "skills")), "dir");
  // ...the foreign entry survives untouched...
  assert.equal(
    await lstatType(path.join(env.CLAUDE_CONFIG_DIR, "skills", "some-other-skill")),
    "symlink"
  );
  // ...and agent-tools' own skills are merged in alongside it.
  assert.equal(
    await lstatType(path.join(env.CLAUDE_CONFIG_DIR, "skills", "code-review")),
    "symlink"
  );

  await fs.rm(tempHome, { recursive: true, force: true });
  await fs.rm(foreignSkillTarget, { recursive: true, force: true });
});

test("editable Claude global uninstall removes only its own merged entries, leaving foreign entries", async () => {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-merge-uninstall-"));
  const env = { ...process.env, CLAUDE_CONFIG_DIR: path.join(tempHome, "claude") };

  const foreignSkillTarget = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-foreign-skill-2-"));
  await fs.writeFile(path.join(foreignSkillTarget, "SKILL.md"), "# foreign\n", "utf8");
  await fs.mkdir(path.join(env.CLAUDE_CONFIG_DIR, "skills"), { recursive: true });
  await fs.symlink(
    foreignSkillTarget,
    path.join(env.CLAUDE_CONFIG_DIR, "skills", "some-other-skill"),
    "dir"
  );

  let result = run("install-editable-claude.js", ["--force"], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  result = run("uninstall-editable-claude.js", [], env);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  // Foreign entry and the shared directory itself survive...
  assert.equal(await lstatType(path.join(env.CLAUDE_CONFIG_DIR, "skills")), "dir");
  assert.equal(
    await lstatType(path.join(env.CLAUDE_CONFIG_DIR, "skills", "some-other-skill")),
    "symlink"
  );
  // ...but agent-tools' own entries are gone.
  await assert.rejects(fs.lstat(path.join(env.CLAUDE_CONFIG_DIR, "skills", "code-review")));

  await fs.rm(tempHome, { recursive: true, force: true });
  await fs.rm(foreignSkillTarget, { recursive: true, force: true });
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

test("copy-based Claude install copies the target guard into .claude/hooks and registers it", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-copy-claude-hook-"));

  const result = run("install-claude.js", [`--target=${temp}`, "--force"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const copied = path.join(temp, ".claude", "hooks", "guard-targets.mjs");
  assert.equal(await lstatType(copied), "file");

  const entries = (await readSettings(path.join(temp, ".claude"))).hooks.PreToolUse;
  assert.equal(entries.length, 1);
  assert.equal(entries[0].matcher, "Bash");
  assert.equal(entries[0].hooks[0].command, 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-targets.mjs"');

  // The Stop hook is copied too, and finds the installed validator at ../skills.
  const closeout = path.join(temp, ".claude", "hooks", "closeout-guard.mjs");
  assert.equal(await lstatType(closeout), "file");
  const stop = (await readSettings(path.join(temp, ".claude"))).hooks.Stop;
  assert.equal(stop.length, 1);
  assert.equal(stop[0].hooks[0].command, 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/closeout-guard.mjs"');
  assert.equal(
    await lstatType(path.join(temp, ".claude", "skills", "spec-validation", "validate-specs.mjs")),
    "file",
  );

  // The installed copy must work on its own, without this checkout.
  const guard = spawnSync(process.execPath, [copied], {
    input: JSON.stringify({ tool_name: "Bash", tool_input: { command: "kubectl get pods" } }),
    encoding: "utf8",
  });
  assert.equal(JSON.parse(guard.stdout).hookSpecificOutput.permissionDecision, "deny");

  await fs.rm(temp, { recursive: true, force: true });
});

test("copy-based Claude install with --no-hooks registers no guard", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-copy-claude-nohook-"));

  const result = run("install-claude.js", [`--target=${temp}`, "--force", "--no-hooks"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal((await readSettings(path.join(temp, ".claude"))).hooks, undefined);
  await assert.rejects(fs.lstat(path.join(temp, ".claude", "hooks", "guard-targets.mjs")));
  await assert.rejects(fs.lstat(path.join(temp, ".claude", "hooks", "closeout-guard.mjs")));

  await fs.rm(temp, { recursive: true, force: true });
});
