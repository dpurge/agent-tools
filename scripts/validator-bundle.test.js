import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { VALIDATOR_BUNDLE, bundleValidator } from "./build-validator.js";

const VALID_FEATURE = `---
title: Sample
kind: feature
status: draft
version: 1
updated: 2026-01-01
---
`;

async function standaloneProject(files) {
  // The bundle is copied to a bare directory: no node_modules, no repository.
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-validator-"));
  const script = path.join(root, "tool", "validate-specs.mjs");
  await fs.mkdir(path.dirname(script), { recursive: true });
  await fs.copyFile(VALIDATOR_BUNDLE, script);

  const project = path.join(root, "project");
  for (const [name, content] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(project, name)), { recursive: true });
    await fs.writeFile(path.join(project, name), content, "utf8");
  }
  await fs.mkdir(project, { recursive: true });
  return { root, project, script };
}

function run(script, args, cwd) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
}

test("the committed validator bundle is up to date (run `npm run build:validator`)", async () => {
  assert.equal(await fs.readFile(VALIDATOR_BUNDLE, "utf8"), await bundleValidator());
});

test("the bundle runs on its own in a project with no specs directory", async () => {
  const { root, project, script } = await standaloneProject({});
  const result = run(script, [], project);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /nothing to validate/);
  await fs.rm(root, { recursive: true, force: true });
});

test("the bundle reports a malformed spec with exit code 1, also through a symlink", async () => {
  const { root, project, script } = await standaloneProject({ "specs/mission.md": "---\ntitle: x\n---\n" });

  const direct = run(script, [], project);
  assert.equal(direct.status, 1, direct.stdout);
  assert.match(direct.stdout, /specs\/mission\.md/);

  const link = path.join(root, "link.mjs");
  await fs.symlink(script, link);
  const viaLink = run(link, [], project);
  assert.equal(viaLink.status, 1, "a symlinked path must still run the validator");
  assert.match(viaLink.stdout, /specs validation failed/);

  await fs.rm(root, { recursive: true, force: true });
});

test("the bundle honours --dir for a shadow specs root", async () => {
  const { root, project, script } = await standaloneProject({ ".agent/specs/features/sample.md": VALID_FEATURE });
  const result = run(script, ["--dir=.agent/specs"], project);
  assert.match(result.stdout, /\.agent\/specs/);
  await fs.rm(root, { recursive: true, force: true });
});
