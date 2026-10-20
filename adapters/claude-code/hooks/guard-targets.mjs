#!/usr/bin/env node

// Claude Code PreToolUse hook (matcher: Bash). Reads the hook payload from
// stdin and, when the command names no cluster, prints a deny decision. The
// detection lives in ./target-guard.mjs (a synced copy of
// adapters/shared/target-guard.mjs); it fails open on anything unparseable.
// Set AGENT_TOOLS_GUARD=off in the environment to disable it.

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { denialReason, findViolation, guardEnabled } from "./target-guard.mjs";

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }));
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  if (!guardEnabled()) return;

  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    return;
  }

  const command = input?.tool_input?.command;
  if (input?.tool_name !== "Bash" || typeof command !== "string") return;

  const violation = findViolation(command);
  if (violation) deny(denialReason(violation));
}

// Compare real paths: the script may be reached through a symlink (macOS temp
// dirs, a symlinked checkout), and a plain URL comparison would then skip
// main() and silently allow everything.
function isRunDirectly() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isRunDirectly()) {
  main();
}
