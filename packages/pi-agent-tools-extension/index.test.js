import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import extension, {
  createExtension,
  loadComponents,
  listDirectories,
  listMarkdown,
  readCommand,
  renderCommandPrompt,
  resolveAssetRoot,
} from "./index.js";

/** Build a temporary asset tree that mirrors the bundled package layout. */
function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pi-agent-tools-"));

  fs.mkdirSync(path.join(root, "skills", "code-review"), { recursive: true });
  fs.writeFileSync(path.join(root, "skills", "code-review", "SKILL.md"), "# code-review\n");
  fs.mkdirSync(path.join(root, "skills", "architecture-review"), { recursive: true });
  fs.writeFileSync(path.join(root, "skills", "architecture-review", "SKILL.md"), "# arch\n");

  fs.mkdirSync(path.join(root, "agents"), { recursive: true });
  fs.writeFileSync(path.join(root, "agents", "engineer.md"), "# engineer\n");
  fs.writeFileSync(path.join(root, "agents", "reviewer.md"), "# reviewer\n");
  fs.writeFileSync(path.join(root, "agents", "notes.txt"), "ignored\n");

  fs.mkdirSync(path.join(root, "workflows"), { recursive: true });
  fs.writeFileSync(path.join(root, "workflows", "release.md"), "# release\n");

  fs.mkdirSync(path.join(root, "commands"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "commands", "sample-feature.md"),
    "# Sample Feature\n\nDo the thing.\n"
  );
  fs.writeFileSync(
    path.join(root, "commands", "bug-investigation.md"),
    "# Bug Investigation\n\nFind the bug.\n"
  );
  fs.writeFileSync(path.join(root, "commands", "release.md"), "# Release\n\nShip it.\n");

  return root;
}

/** Minimal Pi stub that records registered commands and notifications. */
function makePiStub() {
  const commands = new Map();
  const tools = new Map();
  const notifications = [];
  const ctxNotifications = [];
  const sentMessages = [];
  return {
    commands,
    tools,
    notifications,
    ctxNotifications,
    sentMessages,
    registerCommand(name, config) {
      commands.set(name, config);
    },
    registerTool(tool) {
      tools.set(tool.name, tool);
    },
    sendUserMessage(message, options) {
      sentMessages.push({ message, options });
    },
    ui: {
      notify(message) {
        notifications.push(message);
      },
    },
    makeCtx(overrides = {}) {
      return {
        isIdle() {
          return true;
        },
        ui: {
          notify(message) {
            ctxNotifications.push(message);
          },
        },
        ...overrides,
      };
    },
  };
}

let fixture;

before(() => {
  fixture = makeFixture();
});

after(() => {
  fs.rmSync(fixture, { recursive: true, force: true });
});

test("listDirectories returns sorted subdirectories, [] when missing", () => {
  assert.deepEqual(listDirectories(path.join(fixture, "skills")), [
    "architecture-review",
    "code-review",
  ]);
  assert.deepEqual(listDirectories(path.join(fixture, "does-not-exist")), []);
});

test("listMarkdown returns sorted .md basenames and ignores non-md files", () => {
  assert.deepEqual(listMarkdown(path.join(fixture, "agents")), ["engineer", "reviewer"]);
  assert.deepEqual(listMarkdown(path.join(fixture, "missing")), []);
});

test("loadComponents classifies skills (dirs) vs agents/workflows/commands (files)", () => {
  const components = loadComponents(fixture);
  assert.equal(components.root, fixture);
  assert.deepEqual(components.skills, ["architecture-review", "code-review"]);
  assert.deepEqual(components.agents, ["engineer", "reviewer"]);
  assert.deepEqual(components.workflows, ["release"]);
  assert.deepEqual(components.commands, ["bug-investigation", "release", "sample-feature"]);
});

test("resolveAssetRoot prefers the base, then the grandparent, else base", () => {
  assert.equal(resolveAssetRoot(fixture), fixture);

  const nested = path.join(fixture, "extensions", "agent-tools");
  fs.mkdirSync(nested, { recursive: true });
  assert.equal(resolveAssetRoot(nested), fixture);

  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "pi-empty-"));
  assert.equal(resolveAssetRoot(empty), empty);
  fs.rmSync(empty, { recursive: true, force: true });

  // a root with any asset dir (here agents, no skills) still qualifies
  const agentsOnly = fs.mkdtempSync(path.join(os.tmpdir(), "pi-agentsonly-"));
  fs.mkdirSync(path.join(agentsOnly, "agents"), { recursive: true });
  assert.equal(resolveAssetRoot(agentsOnly), agentsOnly);
  fs.rmSync(agentsOnly, { recursive: true, force: true });
});

test("readCommand returns file contents or null", () => {
  assert.match(readCommand(fixture, "sample-feature"), /Sample Feature/);
  assert.equal(readCommand(fixture, "nope"), null);
});

test("renderCommandPrompt substitutes $ARGUMENTS", () => {
  assert.equal(renderCommandPrompt("Hello $ARGUMENTS", "world"), "Hello world");
});

test("renderCommandPrompt substitutes $AGENT_TOOLS_ROOT", () => {
  const rendered = renderCommandPrompt("Root: $AGENT_TOOLS_ROOT", "");
  assert.match(rendered, /Root: .+/);
  assert.match(rendered, /skills/);
});

test("registers the listing commands plus one per command file", () => {
  const pi = makePiStub();
  const result = createExtension(fixture)(pi);
  assert.deepEqual(
    [...pi.commands.keys()].sort(),
    ["agent-tools", "agents", "bug-investigation", "release", "sample-feature", "skills", "workflows"]
  );
  assert.deepEqual(result.commands.sort(), [...pi.commands.keys()].sort());
  for (const [, config] of pi.commands) {
    assert.equal(typeof config.description, "string");
    assert.equal(typeof config.handler, "function");
  }
});

test("registers the subagent tool", () => {
  const pi = makePiStub();
  const result = createExtension(fixture)(pi);
  assert.deepEqual(result.tools, ["subagent"]);
  assert.ok(pi.tools.has("subagent"));
  assert.equal(typeof pi.tools.get("subagent").execute, "function");
});

test("overview handler lists all component types", async () => {
  const pi = makePiStub();
  createExtension(fixture)(pi);
  await pi.commands.get("agent-tools").handler();
  const message = pi.notifications.at(-1);
  assert.match(message, /Skills: architecture-review, code-review/);
  assert.match(message, /Agents: engineer, reviewer/);
  assert.match(message, /Workflows: release/);
  assert.match(message, /Commands: bug-investigation, release, sample-feature/);
});

test("list handlers emit their entries", async () => {
  const pi = makePiStub();
  createExtension(fixture)(pi);
  await pi.commands.get("skills").handler();
  assert.equal(pi.notifications.at(-1), "architecture-review\ncode-review");
  await pi.commands.get("agents").handler();
  assert.equal(pi.notifications.at(-1), "engineer\nreviewer");
});

test("handlers prefer ctx.ui.notify when provided", async () => {
  const pi = makePiStub();
  createExtension(fixture)(pi);
  await pi.commands.get("skills").handler("", pi.makeCtx());
  assert.equal(pi.ctxNotifications.at(-1), "architecture-review\ncode-review");
});

test("each command handler sends its markdown as a user message", async () => {
  const pi = makePiStub();
  createExtension(fixture)(pi);

  await pi.commands.get("sample-feature").handler("add login", pi.makeCtx());
  let sent = pi.sentMessages.at(-1);
  assert.match(sent.message, /Sample Feature/);
  assert.equal(sent.options, undefined);

  await pi.commands.get("bug-investigation").handler("", pi.makeCtx({ isIdle: () => false }));
  sent = pi.sentMessages.at(-1);
  assert.match(sent.message, /Bug Investigation/);
  assert.deepEqual(sent.options, { deliverAs: "followUp" });
  assert.equal(pi.ctxNotifications.at(-1), "Command queued as follow-up");
});

test("reserved command names never override the listing commands", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pi-reserved-"));
  fs.mkdirSync(path.join(root, "workflows"), { recursive: true });
  fs.writeFileSync(path.join(root, "workflows", "xyz.md"), "# xyz\n");
  fs.mkdirSync(path.join(root, "commands"), { recursive: true });
  // A command file that collides with the reserved 'workflows' listing command.
  fs.writeFileSync(path.join(root, "commands", "workflows.md"), "SHOULD NOT RUN\n");

  const pi = makePiStub();
  createExtension(root)(pi);
  await pi.commands.get("workflows").handler();

  const message = pi.notifications.at(-1);
  assert.match(message, /xyz/);
  assert.doesNotMatch(message, /SHOULD NOT RUN/);

  fs.rmSync(root, { recursive: true, force: true });
});

test("command handler reports when its markdown is missing at run time", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pi-runtime-"));
  fs.mkdirSync(path.join(root, "skills", "s"), { recursive: true });
  fs.writeFileSync(path.join(root, "skills", "s", "SKILL.md"), "# s\n");
  fs.mkdirSync(path.join(root, "commands"), { recursive: true });
  fs.writeFileSync(path.join(root, "commands", "release.md"), "# Release\n");

  const pi = makePiStub();
  createExtension(root)(pi);
  // Remove the file after registration to hit the guard branch.
  fs.rmSync(path.join(root, "commands", "release.md"));
  await pi.commands.get("release").handler("x");
  assert.equal(pi.notifications.at(-1), "release command is not installed");

  fs.rmSync(root, { recursive: true, force: true });
});

test("handlers degrade gracefully when no assets are present", async () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "pi-noassets-"));
  const pi = makePiStub();
  createExtension(empty)(pi);

  // Only the listing commands are registered; no command files exist.
  assert.deepEqual([...pi.commands.keys()].sort(), ["agent-tools", "agents", "skills", "workflows"]);
  await pi.commands.get("skills").handler();
  assert.equal(pi.notifications.at(-1), "No skills installed");

  fs.rmSync(empty, { recursive: true, force: true });
});

test("default export is a callable extension function", () => {
  assert.equal(typeof extension, "function");
  const pi = makePiStub();
  assert.doesNotThrow(() => extension(pi));
});
