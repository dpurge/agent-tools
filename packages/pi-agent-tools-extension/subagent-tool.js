import { spawn as defaultSpawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Type } from "typebox";
import { discoverAgents } from "./agents.js";

// Ported from Pi's own `examples/extensions/subagent` reference extension
// (spawn-per-task, NDJSON `--mode json` capture), trimmed to what this
// toolkit needs: no TUI rendering, and agent discovery reuses agent-tools'
// own `core/agents/*.md` roles instead of Pi's separate user/project agent
// directories, since those roles are already the trusted, installed asset
// set — there is no separate "project-local, less trusted" tier here.
const MAX_PARALLEL_TASKS = 8;
const MAX_CONCURRENCY = 4;
const PER_TASK_OUTPUT_CAP = 50 * 1024;

export function emptyUsage() {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, contextTokens: 0, turns: 0 };
}

export function getFinalOutput(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant") {
      for (const part of msg.content) {
        if (part.type === "text") {
          return part.text;
        }
      }
    }
  }
  return "";
}

export function isFailedResult(result) {
  return result.exitCode !== 0 || result.stopReason === "error" || result.stopReason === "aborted";
}

export function getResultOutput(result) {
  if (isFailedResult(result)) {
    return result.errorMessage || result.stderr || getFinalOutput(result.messages) || "(no output)";
  }
  return getFinalOutput(result.messages) || "(no output)";
}

export function truncateParallelOutput(output) {
  const byteLength = Buffer.byteLength(output, "utf8");
  if (byteLength <= PER_TASK_OUTPUT_CAP) {
    return output;
  }
  let truncated = output.slice(0, PER_TASK_OUTPUT_CAP);
  while (Buffer.byteLength(truncated, "utf8") > PER_TASK_OUTPUT_CAP) {
    truncated = truncated.slice(0, -1);
  }
  const omitted = byteLength - Buffer.byteLength(truncated, "utf8");
  return `${truncated}\n\n[Output truncated: ${omitted} bytes omitted.]`;
}

export async function mapWithConcurrencyLimit(items, concurrency, fn) {
  if (items.length === 0) {
    return [];
  }
  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = new Array(limit).fill(null).map(async () => {
    for (;;) {
      const current = nextIndex++;
      if (current >= items.length) {
        return;
      }
      results[current] = await fn(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

async function writePromptToTempFile(agentName, prompt) {
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "agent-tools-subagent-"));
  const safeName = agentName.replace(/[^\w.-]+/g, "_");
  const filePath = path.join(tmpDir, `prompt-${safeName}.md`);
  await fs.promises.writeFile(filePath, prompt, { encoding: "utf8", mode: 0o600 });
  return { dir: tmpDir, filePath };
}

/**
 * Spawn one `pi --mode json` subprocess for `agent` and collect its NDJSON
 * event stream into a result. `spawnFn` defaults to `node:child_process`'s
 * `spawn` but is injectable so tests can drive this without a real `pi`
 * binary on PATH.
 */
export async function runSingleAgent(
  defaultCwd,
  dispatchModel,
  agents,
  agentName,
  task,
  cwd,
  step,
  signal,
  onUpdate,
  { spawnFn = defaultSpawn } = {}
) {
  const agent = agents.find(a => a.name === agentName);

  if (!agent) {
    const available = agents.map(a => `"${a.name}"`).join(", ") || "none";
    return {
      agent: agentName,
      task,
      exitCode: 1,
      messages: [],
      stderr: `Unknown agent: "${agentName}". Available agents: ${available}.`,
      usage: emptyUsage(),
      step,
    };
  }

  const args = ["--mode", "json", "-p", "--no-session"];
  const model = agent.model ?? dispatchModel;
  if (model) {
    args.push("--model", model);
  }
  if (agent.tools && agent.tools.length > 0) {
    args.push("--tools", agent.tools.join(","));
  }

  let tmpPromptDir = null;
  let tmpPromptPath = null;

  const currentResult = {
    agent: agentName,
    task,
    exitCode: 0,
    messages: [],
    stderr: "",
    usage: emptyUsage(),
    model,
    step,
  };

  const emitUpdate = () => {
    if (onUpdate) {
      onUpdate(currentResult);
    }
  };

  try {
    if (agent.systemPrompt.trim()) {
      const tmp = await writePromptToTempFile(agent.name, agent.systemPrompt);
      tmpPromptDir = tmp.dir;
      tmpPromptPath = tmp.filePath;
      args.push("--append-system-prompt", tmpPromptPath);
    }

    args.push(`Task: ${task}`);

    const exitCode = await new Promise(resolve => {
      const proc = spawnFn("pi", args, {
        cwd: cwd ?? defaultCwd,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
      let buffer = "";

      const processLine = line => {
        if (!line.trim()) {
          return;
        }
        let event;
        try {
          event = JSON.parse(line);
        } catch {
          return;
        }

        if (event.type === "message_end" && event.message) {
          const msg = event.message;
          currentResult.messages.push(msg);

          if (msg.role === "assistant") {
            currentResult.usage.turns++;
            const usage = msg.usage;
            if (usage) {
              currentResult.usage.input += usage.input || 0;
              currentResult.usage.output += usage.output || 0;
              currentResult.usage.cacheRead += usage.cacheRead || 0;
              currentResult.usage.cacheWrite += usage.cacheWrite || 0;
              currentResult.usage.cost += usage.cost?.total || 0;
              currentResult.usage.contextTokens = usage.totalTokens || 0;
            }
            if (!currentResult.model && msg.model) {
              currentResult.model = msg.model;
            }
            if (msg.stopReason) {
              currentResult.stopReason = msg.stopReason;
            }
            if (msg.errorMessage) {
              currentResult.errorMessage = msg.errorMessage;
            }
          }
          emitUpdate();
        }

        if (event.type === "tool_result_end" && event.message) {
          currentResult.messages.push(event.message);
          emitUpdate();
        }
      };

      proc.stdout.on("data", data => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          processLine(line);
        }
      });

      proc.stderr.on("data", data => {
        currentResult.stderr += data.toString();
      });

      proc.on("close", code => {
        if (buffer.trim()) {
          processLine(buffer);
        }
        resolve(code ?? 0);
      });

      proc.on("error", () => resolve(1));

      if (signal) {
        const killProc = () => {
          proc.kill("SIGTERM");
          setTimeout(() => {
            if (!proc.killed) {
              proc.kill("SIGKILL");
            }
          }, 5000);
        };
        if (signal.aborted) {
          killProc();
        } else {
          signal.addEventListener("abort", killProc, { once: true });
        }
      }
    });

    currentResult.exitCode = exitCode;
    return currentResult;
  } finally {
    if (tmpPromptPath) {
      try {
        fs.unlinkSync(tmpPromptPath);
      } catch {
        /* already gone */
      }
    }
    if (tmpPromptDir) {
      try {
        fs.rmdirSync(tmpPromptDir);
      } catch {
        /* already gone */
      }
    }
  }
}

const TaskItem = Type.Object({
  agent: Type.String({ description: "Name of the agent to invoke" }),
  task: Type.String({ description: "Task to delegate to the agent" }),
  cwd: Type.Optional(Type.String({ description: "Working directory for the agent process" })),
});

const ChainItem = Type.Object({
  agent: Type.String({ description: "Name of the agent to invoke" }),
  task: Type.String({ description: "Task with an optional {previous} placeholder for the prior step's output" }),
  cwd: Type.Optional(Type.String({ description: "Working directory for the agent process" })),
});

const SubagentParams = Type.Object({
  agent: Type.Optional(Type.String({ description: "Name of the agent to invoke (single mode)" })),
  task: Type.Optional(Type.String({ description: "Task to delegate (single mode)" })),
  tasks: Type.Optional(Type.Array(TaskItem, { description: "Array of {agent, task} for parallel execution" })),
  chain: Type.Optional(Type.Array(ChainItem, { description: "Array of {agent, task} for sequential execution" })),
  cwd: Type.Optional(Type.String({ description: "Working directory for the agent process (single mode)" })),
});

/**
 * Build the `subagent` tool definition for a given asset root. `spawnFn` is
 * exposed for tests; real usage should leave it as the default.
 */
export function createSubagentTool(root, { spawnFn } = {}) {
  return {
    name: "subagent",
    label: "Subagent",
    description: [
      "Delegate a task to one of this project's agent-tools roles, each running",
      "as an isolated `pi` subprocess with its own context window.",
      "Modes: single (agent + task), parallel (tasks array), chain (sequential",
      "steps with a {previous} placeholder for the prior step's output).",
      `Agents come from ${path.join(root, "agents")}.`,
    ].join(" "),
    parameters: SubagentParams,

    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      const agents = discoverAgents(root);
      const dispatchModel = ctx?.model ? `${ctx.model.provider}/${ctx.model.id}` : undefined;
      const defaultCwd = ctx?.cwd ?? root;
      const spawnOpts = { spawnFn };

      const hasChain = (params.chain?.length ?? 0) > 0;
      const hasTasks = (params.tasks?.length ?? 0) > 0;
      const hasSingle = Boolean(params.agent && params.task);
      const modeCount = Number(hasChain) + Number(hasTasks) + Number(hasSingle);

      if (modeCount !== 1) {
        const available = agents.map(a => a.name).join(", ") || "none";
        return {
          content: [
            {
              type: "text",
              text: `Invalid parameters. Provide exactly one of agent+task, tasks, or chain.\nAvailable agents: ${available}`,
            },
          ],
          details: {},
        };
      }

      if (params.chain && params.chain.length > 0) {
        const results = [];
        let previousOutput = "";

        for (let i = 0; i < params.chain.length; i++) {
          const step = params.chain[i];
          const taskWithContext = step.task.replaceAll("{previous}", previousOutput);

          const chainUpdate = onUpdate
            ? partial =>
                onUpdate({
                  content: [{ type: "text", text: getFinalOutput(partial.messages) || "(running...)" }],
                  details: { mode: "chain", results: [...results, partial] },
                })
            : undefined;

          const result = await runSingleAgent(
            defaultCwd,
            dispatchModel,
            agents,
            step.agent,
            taskWithContext,
            step.cwd,
            i + 1,
            signal,
            chainUpdate,
            spawnOpts
          );
          results.push(result);

          if (isFailedResult(result)) {
            return {
              content: [
                { type: "text", text: `Chain stopped at step ${i + 1} (${step.agent}): ${getResultOutput(result)}` },
              ],
              details: { mode: "chain", results },
              isError: true,
            };
          }
          previousOutput = getFinalOutput(result.messages);
        }
        return {
          content: [{ type: "text", text: getFinalOutput(results.at(-1).messages) || "(no output)" }],
          details: { mode: "chain", results },
        };
      }

      if (params.tasks && params.tasks.length > 0) {
        if (params.tasks.length > MAX_PARALLEL_TASKS) {
          return {
            content: [
              { type: "text", text: `Too many parallel tasks (${params.tasks.length}). Max is ${MAX_PARALLEL_TASKS}.` },
            ],
            details: {},
          };
        }

        const results = await mapWithConcurrencyLimit(params.tasks, MAX_CONCURRENCY, t =>
          runSingleAgent(
            defaultCwd,
            dispatchModel,
            agents,
            t.agent,
            t.task,
            t.cwd,
            undefined,
            signal,
            onUpdate ? partial => onUpdate({ content: [{ type: "text", text: `[${partial.agent}] running...` }], details: { mode: "parallel" } }) : undefined,
            spawnOpts
          )
        );

        const successCount = results.filter(r => !isFailedResult(r)).length;
        const summaries = results.map(r => {
          const output = truncateParallelOutput(getResultOutput(r));
          const status = isFailedResult(r)
            ? `failed${r.stopReason && r.stopReason !== "end" ? ` (${r.stopReason})` : ""}`
            : "completed";
          return `### [${r.agent}] ${status}\n\n${output}`;
        });
        return {
          content: [
            { type: "text", text: `Parallel: ${successCount}/${results.length} succeeded\n\n${summaries.join("\n\n---\n\n")}` },
          ],
          details: { mode: "parallel", results },
        };
      }

      const singleUpdate = onUpdate
        ? partial =>
            onUpdate({
              content: [{ type: "text", text: getFinalOutput(partial.messages) || "(running...)" }],
              details: { mode: "single", results: [partial] },
            })
        : undefined;

      const result = await runSingleAgent(
        defaultCwd,
        dispatchModel,
        agents,
        params.agent,
        params.task,
        params.cwd,
        undefined,
        signal,
        singleUpdate,
        spawnOpts
      );

      if (isFailedResult(result)) {
        return {
          content: [{ type: "text", text: `Agent ${result.stopReason || "failed"}: ${getResultOutput(result)}` }],
          details: { mode: "single", results: [result] },
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: getFinalOutput(result.messages) || "(no output)" }],
        details: { mode: "single", results: [result] },
      };
    },
  };
}
