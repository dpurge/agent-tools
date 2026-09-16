import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { discoverAgents, loadAgentConfig, parseAgentFrontmatter } from "./agents.js";

const ENGINEER_MD = `---
name: engineer
description: Implements approved designs and writes tests.
version: 1.0.0
model_preference:
  - "deepseek/deepseek-v4-flash"
  - "z-ai/glm-5.2"
tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
permissions:
  edit: true
  write: true
  bash: true
skills:
  - code-review
---

# Engineer

You implement the approved plan.
`;

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pi-agents-"));
  fs.mkdirSync(path.join(root, "agents"), { recursive: true });
  fs.writeFileSync(path.join(root, "agents", "engineer.md"), ENGINEER_MD);
  fs.writeFileSync(path.join(root, "agents", "broken.md"), "no frontmatter here\n");
  fs.writeFileSync(path.join(root, "agents", "notes.txt"), "ignored\n");
  return root;
}

test("parseAgentFrontmatter reads scalars and lists, skipping nested maps", () => {
  const { attributes, body } = parseAgentFrontmatter(ENGINEER_MD);
  assert.equal(attributes.name, "engineer");
  assert.equal(attributes.description, "Implements approved designs and writes tests.");
  assert.deepEqual(attributes.model_preference, ["deepseek/deepseek-v4-flash", "z-ai/glm-5.2"]);
  assert.deepEqual(attributes.tools, ["Read", "Write", "Edit", "Grep", "Glob", "Bash"]);
  assert.match(body, /^# Engineer/);
});

test("loadAgentConfig maps Claude-style tool names to Pi's and picks the first model preference", () => {
  const root = makeFixture();

  const config = loadAgentConfig(root, "engineer");
  assert.equal(config.name, "engineer");
  assert.deepEqual(config.tools, ["read", "write", "edit", "grep", "find", "bash"]);
  assert.equal(config.model, "deepseek/deepseek-v4-flash");
  assert.match(config.systemPrompt, /You implement the approved plan/);

  fs.rmSync(root, { recursive: true, force: true });
});

test("loadAgentConfig returns null for a missing or malformed file", () => {
  const root = makeFixture();
  assert.equal(loadAgentConfig(root, "broken"), null);
  assert.equal(loadAgentConfig(root, "does-not-exist"), null);
  fs.rmSync(root, { recursive: true, force: true });
});

test("discoverAgents lists only valid, sorted agents and ignores non-.md files", () => {
  const root = makeFixture();
  const agents = discoverAgents(root);
  assert.deepEqual(agents.map(a => a.name), ["engineer"]);
  fs.rmSync(root, { recursive: true, force: true });
});

test("discoverAgents returns [] when the agents directory is missing", () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "pi-agents-empty-"));
  assert.deepEqual(discoverAgents(empty), []);
  fs.rmSync(empty, { recursive: true, force: true });
});
