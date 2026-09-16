import assert from "node:assert/strict";
import test from "node:test";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  createSubagentTool,
  getFinalOutput,
  isFailedResult,
  mapWithConcurrencyLimit,
  runSingleAgent,
  truncateParallelOutput,
} from "./subagent-tool.js";

/** A fake `pi` child process: emits NDJSON lines on stdout, then closes. */
function makeFakeProc({ lines = [], exitCode = 0, stderr = "" } = {}) {
  const proc = new EventEmitter();
  proc.stdout = new EventEmitter();
  proc.stderr = new EventEmitter();
  proc.killed = false;
  proc.kill = () => {
    proc.killed = true;
  };

  queueMicrotask(() => {
    for (const line of lines) {
      proc.stdout.emit("data", Buffer.from(`${line}\n`));
    }
    if (stderr) {
      proc.stderr.emit("data", Buffer.from(stderr));
    }
    proc.emit("close", exitCode);
  });

  return proc;
}

function assistantLine(text, extra = {}) {
  return JSON.stringify({
    type: "message_end",
    message: {
      role: "assistant",
      content: [{ type: "text", text }],
      usage: { input: 10, output: 5, cacheRead: 0, cacheWrite: 0, cost: { total: 0.001 }, totalTokens: 15 },
      stopReason: "end",
      ...extra,
    },
  });
}

const AGENTS = [
  { name: "worker", description: "does work", tools: undefined, model: undefined, systemPrompt: "You work." },
];

test("runSingleAgent returns an error result for an unknown agent without spawning", async () => {
  let spawnCalls = 0;
  const spawnFn = () => {
    spawnCalls++;
    return makeFakeProc({});
  };

  const result = await runSingleAgent(
    "/cwd",
    undefined,
    AGENTS,
    "does-not-exist",
    "do it",
    undefined,
    undefined,
    undefined,
    undefined,
    { spawnFn }
  );

  assert.equal(spawnCalls, 0);
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Unknown agent/);
  assert.match(result.stderr, /worker/);
});

test("runSingleAgent parses NDJSON output into a successful result", async () => {
  const spawnFn = () => makeFakeProc({ lines: [assistantLine("Hello from agent")], exitCode: 0 });

  const result = await runSingleAgent(
    "/cwd",
    undefined,
    AGENTS,
    "worker",
    "say hello",
    undefined,
    undefined,
    undefined,
    undefined,
    { spawnFn }
  );

  assert.equal(result.exitCode, 0);
  assert.equal(isFailedResult(result), false);
  assert.equal(getFinalOutput(result.messages), "Hello from agent");
  assert.equal(result.usage.input, 10);
  assert.equal(result.usage.turns, 1);
  assert.equal(result.stopReason, "end");
});

test("runSingleAgent treats a non-zero exit as failed and surfaces stderr", async () => {
  const spawnFn = () => makeFakeProc({ lines: [], exitCode: 1, stderr: "boom" });

  const result = await runSingleAgent(
    "/cwd",
    undefined,
    AGENTS,
    "worker",
    "say hello",
    undefined,
    undefined,
    undefined,
    undefined,
    { spawnFn }
  );

  assert.equal(isFailedResult(result), true);
  assert.match(result.stderr, /boom/);
});

test("truncateParallelOutput caps byte length and notes what was omitted", () => {
  const short = "hello";
  assert.equal(truncateParallelOutput(short), short);

  const long = "x".repeat(60 * 1024);
  const truncated = truncateParallelOutput(long);
  assert.ok(truncated.length < long.length);
  assert.match(truncated, /bytes omitted/);
});

test("mapWithConcurrencyLimit preserves result order regardless of completion order", async () => {
  const results = await mapWithConcurrencyLimit([3, 1, 2], 2, async n => {
    await new Promise(resolve => setTimeout(resolve, n));
    return n * 10;
  });
  assert.deepEqual(results, [30, 10, 20]);
});

function makeAgentFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pi-subagent-tool-"));
  fs.mkdirSync(path.join(root, "agents"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "agents", "worker.md"),
    ["---", "name: worker", "description: does work", "---", "", "You work."].join("\n")
  );
  return root;
}

test("createSubagentTool rejects params that select zero or multiple modes", async () => {
  const root = makeAgentFixture();
  const tool = createSubagentTool(root, { spawnFn: () => makeFakeProc({}) });

  const result = await tool.execute("id", {}, undefined, undefined, { cwd: root });
  assert.match(result.content[0].text, /Invalid parameters/);
  assert.match(result.content[0].text, /worker/);

  fs.rmSync(root, { recursive: true, force: true });
});

test("createSubagentTool single mode dispatches to the named agent and returns its output", async () => {
  const root = makeAgentFixture();
  let spawnedArgs = null;
  const spawnFn = (command, args) => {
    spawnedArgs = args;
    return makeFakeProc({ lines: [assistantLine("done")] });
  };
  const tool = createSubagentTool(root, { spawnFn });

  const result = await tool.execute("id", { agent: "worker", task: "build the thing" }, undefined, undefined, {
    cwd: root,
  });

  assert.equal(result.content[0].text, "done");
  assert.deepEqual(result.details.mode, "single");
  assert.ok(spawnedArgs.includes("Task: build the thing"));
  assert.ok(spawnedArgs.includes("--no-session"));

  fs.rmSync(root, { recursive: true, force: true });
});
