import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createOpenCodePlugin } from "../packages/opencode-agent-tools-plugin/runtime.js";

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "opencode-agent-tools-"));
  fs.mkdirSync(path.join(root, "commands"), { recursive: true });
  fs.writeFileSync(path.join(root, "commands", "research.md"), "# Research\n\nDo it.\n");
  fs.writeFileSync(path.join(root, "commands", "workflows.md"), "SHOULD NOT REGISTER\n");
  return root;
}

test("OpenCode runtime registers commands when host exposes registerCommand", async () => {
  const root = makeFixture();
  const commands = new Map();
  const plugin = createOpenCodePlugin(root);

  const result = await plugin({
    registerCommand(name, config) {
      commands.set(name, config);
    },
  });

  assert.equal(commands.has("research"), true);
  assert.equal(commands.has("workflows"), false);
  assert.deepEqual(result.commands, ["research"]);

  const message = await commands.get("research").handler("topic");
  assert.match(message, /^Request: topic/);
  assert.match(message, /# Research/);

  fs.rmSync(root, { recursive: true, force: true });
});

test("OpenCode runtime degrades when no command API is available", async () => {
  const root = makeFixture();
  const plugin = createOpenCodePlugin(root);
  const result = await plugin({});

  assert.deepEqual(result.commands, []);
  fs.rmSync(root, { recursive: true, force: true });
});
