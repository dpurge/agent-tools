#!/usr/bin/env node

// Claude Code Stop hook. Before a session ends, it runs the specs validator
// and blocks (exit 2, reason on stderr) when the working tree changed specs
// and the validator reports a closeout error: a closed feature still listed
// in a roadmap Now, a done spec with a "Not started." section, or a done spec
// with no CI/release decision. Any other finding, and every situation where
// it cannot verify (no specs, no git, no validator, a crash), lets the
// session end. Set AGENT_TOOLS_CLOSEOUT=off in the environment to disable it.
//
// Hard limits, independent of the host (Claude Code resets its own cap of
// consecutive stop-hook continuations whenever the model calls a tool, so a
// block, edit, stop, block cycle would otherwise be unbounded): at most
// MAX_BLOCKS_PER_SESSION blocks per session, never the same message twice,
// feedback of at most MAX_MESSAGE_CHARS characters, a validator timeout of
// VALIDATOR_TIMEOUT_MS, and every failure (unreadable or unwritable state,
// validator timeout or crash) lets the session end. Per-session state lives in
// <os.tmpdir()>/agent-tools-closeout/<session key>.json; the tests point
// AGENT_TOOLS_CLOSEOUT_STATE_DIR at a throwaway directory instead.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOOK_DIR = path.dirname(fileURLToPath(import.meta.url));

// Where validate-specs.mjs lives relative to this script: a project or plugin
// install (skills next to hooks), and the checkout used by the editable install.
const VALIDATOR_CANDIDATES = [
  path.join(HOOK_DIR, "..", "skills", "spec-validation", "validate-specs.mjs"),
  path.join(HOOK_DIR, "..", "..", "..", "core", "skills", "spec-validation", "validate-specs.mjs"),
];

const CLOSEOUT_ERRORS = [
  "closed feature still listed in Now",
  "status is done but section",
  "status is done but Documentation Review has no CI/release decision",
];

const INSTRUCTION =
  "Close the feature before finishing: fix the lines above (see /code B5 Closeout checklist). " +
  "Set AGENT_TOOLS_CLOSEOUT=off to disable this check.";

export const MAX_BLOCKS_PER_SESSION = 2;
export const MAX_ERROR_LINES = 5;
export const MAX_LINE_CHARS = 300;
export const MAX_MESSAGE_CHARS = 1200;
export const VALIDATOR_TIMEOUT_MS = 10000;
const MAX_SESSION_KEY_CHARS = 64;

const ANSI_RE = /\u001b\[[0-9;]*m/g;

export function closeoutEnabled(env = process.env) {
  return String(env.AGENT_TOOLS_CLOSEOUT ?? "").toLowerCase() !== "off";
}

function git(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return result.error || result.status !== 0 ? null : result.stdout;
}

/** The first `specs/` or `.agent/specs/` under the cwd, then under its git root. */
export function findSpecsRoot(cwd) {
  const gitRoot = git(cwd, ["rev-parse", "--show-toplevel"])?.trim();
  for (const base of [cwd, gitRoot].filter(Boolean)) {
    for (const sub of ["specs", path.join(".agent", "specs")]) {
      const candidate = path.join(base, sub);
      if (existsSync(candidate)) return candidate;
    }
  }
  return null;
}

/** True when git shows changes under the specs root; false when git is unavailable. */
export function hasSpecsChanges(specsRoot) {
  const status = git(specsRoot, ["status", "--porcelain", "--", "."]);
  return Boolean(status && status.trim());
}

export function findValidator(candidates = VALIDATOR_CANDIDATES) {
  return candidates.find(candidate => existsSync(candidate)) ?? null;
}

/** The closeout error lines in the validator's output, colors stripped. */
export function closeoutFindings(output) {
  return output
    .replace(ANSI_RE, "")
    .split(/\r?\n/)
    .filter(line => CLOSEOUT_ERRORS.some(needle => line.includes(needle)))
    .map(line => line.trim());
}

function sha1(text) {
  return createHash("sha1").update(text).digest("hex");
}

/** The state file for this session: sanitised session_id, else a hash of the cwd. */
export function stateFilePath(input, env = process.env) {
  const sessionKey =
    typeof input.session_id === "string"
      ? input.session_id.replace(/[^A-Za-z0-9_-]/g, "").slice(0, MAX_SESSION_KEY_CHARS)
      : "";
  const key = sessionKey || `cwd-${sha1(input.cwd)}`;
  const dir = env.AGENT_TOOLS_CLOSEOUT_STATE_DIR || path.join(os.tmpdir(), "agent-tools-closeout");
  return path.join(dir, `${key}.json`);
}

/** The session's state; a fresh one when no file exists; null when it cannot be trusted. */
function readState(file) {
  if (!existsSync(file)) return { blocks: 0, seen: [] };
  try {
    const state = JSON.parse(readFileSync(file, "utf8"));
    const isValid =
      Number.isInteger(state?.blocks) && state.blocks >= 0 && Array.isArray(state?.seen);
    return isValid ? state : null;
  } catch {
    return null;
  }
}

function writeState(file, state) {
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** At most MAX_ERROR_LINES lines of MAX_LINE_CHARS, plus a count of the rest; at most MAX_MESSAGE_CHARS in all. */
export function buildMessage(findings) {
  const shown = findings.slice(0, MAX_ERROR_LINES).map(line => line.slice(0, MAX_LINE_CHARS));
  const hidden = findings.length - shown.length;
  const tail = `${hidden > 0 ? `\n(and ${hidden} more; run validate-specs)` : ""}\n\n${INSTRUCTION}\n`;
  const body = shown.join("\n").slice(0, Math.max(0, MAX_MESSAGE_CHARS - tail.length));
  return `${body}${tail}`;
}

/** Returns the message to block with, or null to let the session end. */
export function checkCloseout(input, { env = process.env, validatorCandidates } = {}) {
  if (input?.stop_hook_active === true || !closeoutEnabled(env)) return null;
  if (typeof input?.cwd !== "string") return null;

  const specsRoot = findSpecsRoot(input.cwd);
  if (!specsRoot || !hasSpecsChanges(specsRoot)) return null;

  const validator = findValidator(validatorCandidates);
  if (!validator) return null;

  const stateFile = stateFilePath(input, env);
  const state = readState(stateFile);
  if (!state || state.blocks >= MAX_BLOCKS_PER_SESSION) return null;

  const today = new Date().toISOString().slice(0, 10);
  const run = spawnSync(process.execPath, [validator, `--dir=${specsRoot}`, `--today=${today}`], {
    encoding: "utf8",
    timeout: VALIDATOR_TIMEOUT_MS,
  });
  if (run.error || run.signal) return null;

  const findings = closeoutFindings(`${run.stdout ?? ""}\n${run.stderr ?? ""}`);
  if (!findings.length) return null;

  const errorHash = sha1(findings.join("\n"));
  if (state.seen.includes(errorHash)) return null;

  // Recorded before the caller prints anything, so a crash cannot cause a repeat.
  const recorded = writeState(stateFile, {
    blocks: state.blocks + 1,
    seen: [...state.seen, errorHash],
  });
  return recorded ? buildMessage(findings) : null;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    return;
  }

  const message = checkCloseout(input);
  if (message) {
    process.stderr.write(message);
    process.exitCode = 2;
  }
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
