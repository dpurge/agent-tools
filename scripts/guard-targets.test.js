import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { findViolation } from "../adapters/shared/target-guard.mjs";
import { GUARD_COPIES, GUARD_SOURCE } from "./lib/install-common.js";
import { createExtension, guardToolCall } from "../packages/pi-agent-tools-extension/index.js";
import { createOpenCodePlugin, guardToolExecution } from "../packages/opencode-agent-tools-plugin/runtime.js";

const HOOK = path.join(process.cwd(), "adapters", "claude-code", "hooks", "guard-targets.mjs");

function runHook(payload, env = {}) {
  return spawnSync(process.execPath, [HOOK], {
    input: typeof payload === "string" ? payload : JSON.stringify(payload),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

test("denies kubectl and helm commands that do not name a target", () => {
  for (const command of [
    "kubectl get pods",
    "kubectl -n app get pods",
    "helm upgrade --install app ./chart",
    "helm -n app upgrade app ./chart",
    "cd x && kubectl apply -f y.yaml",
    "kubectl get pods | grep Running",
    "sudo /usr/local/bin/kubectl delete pod p",
    "FOO=1 kubectl get nodes",
  ]) {
    assert.ok(findViolation(command), `expected a violation for: ${command}`);
  }
});

test("allows commands that name the target", () => {
  for (const command of [
    "kubectl --kubeconfig=/abs/kubeconfig get pods",
    "kubectl --kubeconfig /abs/kubeconfig -n app get pods",
    "KUBECONFIG=/abs/kubeconfig kubectl get pods",
    "helm --kubeconfig=/abs/kubeconfig upgrade app ./chart",
    "helm --kube-context dev upgrade app ./chart",
    'K=(kubectl --kubeconfig=/abs/kubeconfig); "${K[@]}" get pods',
  ]) {
    assert.equal(findViolation(command), null, `expected no violation for: ${command}`);
  }
});

test("allows commands that cannot reach a cluster", () => {
  for (const command of [
    "helm template app ./chart",
    "helm -n app template app ./chart",
    "helm lint ./chart",
    "helm repo add x https://example.invalid",
    "kubectl version --client",
    "kubectl completion zsh",
    "ls -la && echo kubectl",
    "git log --oneline",
  ]) {
    assert.equal(findViolation(command), null, `expected no violation for: ${command}`);
  }
});

test("hook prints a deny decision for a violating Bash command", () => {
  const result = runHook({ tool_name: "Bash", tool_input: { command: "kubectl get pods" } });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, "PreToolUse");
  assert.equal(output.hookSpecificOutput.permissionDecision, "deny");
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /--kubeconfig/);
});

test("hook is silent for allowed commands, other tools, bad input and when switched off", () => {
  const silent = [
    runHook({ tool_name: "Bash", tool_input: { command: "kubectl --kubeconfig=/k get pods" } }),
    runHook({ tool_name: "Edit", tool_input: { command: "kubectl get pods" } }),
    runHook("not json"),
    runHook({ tool_name: "Bash", tool_input: {} }),
    runHook({ tool_name: "Bash", tool_input: { command: "kubectl get pods" } }, { AGENT_TOOLS_GUARD: "off" }),
  ];
  for (const result of silent) {
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "");
  }
});

test("hook still denies when it is reached through a symlinked path", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-guard-link-"));
  const link = path.join(temp, "guard-targets.mjs");
  await fs.symlink(HOOK, link);

  const result = spawnSync(process.execPath, [link], {
    input: JSON.stringify({ tool_name: "Bash", tool_input: { command: "kubectl get pods" } }),
    encoding: "utf8",
  });
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.permissionDecision, "deny");

  await fs.rm(temp, { recursive: true, force: true });
});

test("every shipped copy of the guard module matches the source (run `npm run sync:guard`)", async () => {
  const source = await fs.readFile(path.join(process.cwd(), GUARD_SOURCE), "utf8");
  for (const copy of GUARD_COPIES) {
    assert.equal(await fs.readFile(path.join(process.cwd(), copy), "utf8"), source, `${copy} has drifted`);
  }
});

test("Pi tool_call guard blocks an unnamed cluster and lets everything else through", () => {
  const blocked = guardToolCall({ toolName: "bash", input: { command: "kubectl get pods" } });
  assert.equal(blocked.block, true);
  assert.match(blocked.reason, /--kubeconfig/);

  for (const event of [
    { toolName: "bash", input: { command: "kubectl --kubeconfig=/k get pods" } },
    { toolName: "bash", input: { command: "helm template x ./chart" } },
    { toolName: "bash", input: {} },
    { toolName: "read", input: { path: "kubectl get pods" } },
    undefined,
  ]) {
    assert.equal(guardToolCall(event), undefined);
  }
  assert.equal(
    guardToolCall({ toolName: "bash", input: { command: "kubectl get pods" } }, { AGENT_TOOLS_GUARD: "off" }),
    undefined,
  );
});

test("Pi extension registers the guard on tool_call", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-pi-guard-"));
  const handlers = {};
  const pi = {
    registerCommand() {},
    registerTool() {},
    sendUserMessage() {},
    on(name, handler) {
      handlers[name] = handler;
    },
  };

  createExtension(root)(pi);
  assert.equal(typeof handlers.tool_call, "function");
  assert.equal(handlers.tool_call({ toolName: "bash", input: { command: "helm upgrade app ./c" } }).block, true);

  await fs.rm(root, { recursive: true, force: true });
});

test("OpenCode tool.execute.before guard throws for an unnamed cluster only", () => {
  assert.throws(
    () => guardToolExecution({ tool: "bash" }, { args: { command: "kubectl get pods" } }),
    /--kubeconfig/,
  );

  for (const [input, output] of [
    [{ tool: "bash" }, { args: { command: "kubectl --kubeconfig /k get pods" } }],
    [{ tool: "bash" }, { args: { command: "helm lint ./chart" } }],
    [{ tool: "bash" }, { args: {} }],
    [{ tool: "read" }, { args: { filePath: "kubectl get pods" } }],
    [undefined, undefined],
  ]) {
    assert.doesNotThrow(() => guardToolExecution(input, output));
  }
  assert.doesNotThrow(() =>
    guardToolExecution({ tool: "bash" }, { args: { command: "kubectl get pods" } }, { AGENT_TOOLS_GUARD: "off" }),
  );
});

test("OpenCode plugin returns the guard as a tool.execute.before hook", async () => {
  const hooks = await createOpenCodePlugin(await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-oc-guard-")))({});
  assert.equal(typeof hooks["tool.execute.before"], "function");
  await assert.rejects(
    hooks["tool.execute.before"]({ tool: "bash" }, { args: { command: "helm upgrade app ./c" } }),
    /--kube-context/,
  );
});
