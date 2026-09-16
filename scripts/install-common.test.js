import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  ROOT,
  buildRulesSection,
  installManifestComponents,
  installRules,
  mergeRulesIntoAgentsFile,
  writeRulesDocument,
} from "./lib/install-common.js";

test("installManifestComponents copies only manifest-listed assets", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-install-"));

  await installManifestComponents(
    {
      skills: ["code-review"],
      agents: ["engineer"],
      workflows: ["release"],
      commands: ["research"],
    },
    temp,
    { force: true }
  );

  await assert.doesNotReject(fs.access(path.join(temp, "skills", "code-review", "SKILL.md")));
  await assert.doesNotReject(fs.access(path.join(temp, "agents", "engineer.md")));
  await assert.doesNotReject(fs.access(path.join(temp, "workflows", "release.md")));
  await assert.doesNotReject(fs.access(path.join(temp, "commands", "research.md")));

  await assert.rejects(fs.access(path.join(temp, "agents", "reviewer.md")));
  await assert.rejects(fs.access(path.join(temp, "commands", "story.md")));

  await fs.rm(temp, { recursive: true, force: true });
});

test("installRules copies markdown rules into a rules directory", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-rules-"));

  await installRules(temp, { force: true });

  await assert.doesNotReject(fs.access(path.join(temp, "rules", "coding-style.md")));
  await assert.doesNotReject(fs.access(path.join(temp, "rules", "git.md")));
  await assert.doesNotReject(fs.access(path.join(temp, "rules", "security.md")));

  await fs.rm(temp, { recursive: true, force: true });
});

test("buildRulesSection wraps repo rules under one marker-bounded heading", async () => {
  const content = await buildRulesSection();

  assert.match(content, /^<!-- agent-tools:rules:start -->\n/);
  assert.match(content, /## Agent Tools Rules/);
  assert.match(content, /<!-- agent-tools:rules:end -->\n?$/);

  const codingStyle = await fs.readFile(path.join(ROOT, "core", "rules", "coding-style.md"), "utf8");
  // Headings are demoted two levels (# -> ###) so they nest under the
  // wrapper heading instead of colliding with it as a sibling h1.
  assert.match(content, /### Coding Style/);
  assert.doesNotMatch(content, /^# Coding Style/m);
  void codingStyle;
});

test("mergeRulesIntoAgentsFile creates AGENTS.md when missing", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-agentsmd-"));
  const agentsFile = path.join(temp, "AGENTS.md");

  await mergeRulesIntoAgentsFile(agentsFile);

  const content = await fs.readFile(agentsFile, "utf8");
  assert.match(content, /## Agent Tools Rules/);

  await fs.rm(temp, { recursive: true, force: true });
});

test("mergeRulesIntoAgentsFile preserves existing content and appends the rules section", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-agentsmd-"));
  const agentsFile = path.join(temp, "AGENTS.md");
  await fs.writeFile(agentsFile, "# My Project\n\nSome project-specific orientation.\n", "utf8");

  await mergeRulesIntoAgentsFile(agentsFile);

  const content = await fs.readFile(agentsFile, "utf8");
  assert.match(content, /# My Project/);
  assert.match(content, /Some project-specific orientation\./);
  assert.match(content, /## Agent Tools Rules/);

  await fs.rm(temp, { recursive: true, force: true });
});

test("mergeRulesIntoAgentsFile replaces the marked section in place on re-run, not duplicating it", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-agentsmd-"));
  const agentsFile = path.join(temp, "AGENTS.md");
  await fs.writeFile(agentsFile, "# My Project\n", "utf8");

  await mergeRulesIntoAgentsFile(agentsFile);
  await mergeRulesIntoAgentsFile(agentsFile);

  const content = await fs.readFile(agentsFile, "utf8");
  const markerCount = (content.match(/<!-- agent-tools:rules:start -->/g) || []).length;
  assert.equal(markerCount, 1);

  await fs.rm(temp, { recursive: true, force: true });
});

test("writeRulesDocument writes exactly @AGENTS.md and merges rules into the sibling AGENTS.md", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-"));
  const file = path.join(temp, "CLAUDE.md");

  const wrote = await writeRulesDocument(file, { force: true });
  assert.equal(wrote, true);
  assert.equal(await fs.readFile(file, "utf8"), "@AGENTS.md\n");

  const agentsContent = await fs.readFile(path.join(temp, "AGENTS.md"), "utf8");
  assert.match(agentsContent, /## Agent Tools Rules/);

  await fs.rm(temp, { recursive: true, force: true });
});

test("writeRulesDocument honors force=false and force=true for CLAUDE.md itself", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-"));
  const file = path.join(temp, "CLAUDE.md");

  await fs.writeFile(file, "original\n", "utf8");
  const first = await writeRulesDocument(file, { force: false });
  assert.equal(first, false);
  assert.equal(await fs.readFile(file, "utf8"), "original\n");

  const second = await writeRulesDocument(file, { force: true });
  assert.equal(second, true);
  assert.equal(await fs.readFile(file, "utf8"), "@AGENTS.md\n");

  await fs.rm(temp, { recursive: true, force: true });
});
