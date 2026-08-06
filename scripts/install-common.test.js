import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  ROOT,
  buildRulesDocument,
  installManifestComponents,
  installRules,
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

test("buildRulesDocument combines repo rules under one heading", async () => {
  const content = await buildRulesDocument();

  assert.match(content, /^# Agent Tools Rules\n\n/);

  const codingStyle = await fs.readFile(path.join(ROOT, "core", "rules", "coding-style.md"), "utf8");
  assert.match(content, new RegExp(codingStyle.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("writeRulesDocument honors force=false and force=true", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-claude-"));
  const file = path.join(temp, "CLAUDE.md");

  await fs.writeFile(file, "original\n", "utf8");
  const first = await writeRulesDocument(file, { force: false });
  assert.equal(first, false);
  assert.equal(await fs.readFile(file, "utf8"), "original\n");

  const second = await writeRulesDocument(file, { force: true });
  assert.equal(second, true);
  assert.notEqual(await fs.readFile(file, "utf8"), "original\n");

  await fs.rm(temp, { recursive: true, force: true });
});
