// Host-neutral detection for the agent-tools target guard: finds `kubectl` and
// `helm` commands that do not name their cluster, because a shell's default
// KUBECONFIG or current context can include production. See the `operations`
// rule and the `safe-operations` skill for the policy this enforces.
//
// Deliberately conservative: it only inspects the first word of each command
// segment, allows commands that cannot reach a cluster, and has no side
// effects. It is a seat belt, not a sandbox: it does not see `bash -c "..."`,
// scripts, or aliases. Host adapters call it and decide how to block.
//
// SOURCE OF TRUTH. Copies live next to each host adapter; run
// `npm run sync:guard` after editing (a test fails when a copy has drifted).

const WRAPPERS = new Set(["sudo", "time", "command", "exec", "nohup", "env"]);

// Subcommands that never contact a cluster, per tool.
const LOCAL_SUBCOMMANDS = {
  helm: new Set([
    "template", "lint", "create", "package", "dependency", "dep", "repo", "search",
    "show", "inspect", "pull", "fetch", "push", "registry", "verify", "version",
    "completion", "env", "plugin", "help", "--help", "-h", "--version",
  ]),
  kubectl: new Set(["version", "completion", "help", "options", "kustomize", "--help", "-h", "--version"]),
};

function splitSegments(command) {
  return command.split(/&&|\|\||[;|\n]/).map(segment => segment.trim()).filter(Boolean);
}

/** First word that is the command: skips env assignments and wrappers. */
function commandWords(segment) {
  const words = segment.split(/\s+/);
  let index = 0;
  while (index < words.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index]) || WRAPPERS.has(words[index]))) {
    index += 1;
  }
  return { words: words.slice(index), prefix: words.slice(0, index) };
}

function namesTarget(tool, segment, prefix) {
  if (/(^|\s)--kubeconfig(=|\s)/.test(segment)) return true;
  if (tool === "helm" && /(^|\s)--kube-context(=|\s)/.test(segment)) return true;
  // An inline assignment is explicit (it is part of this very command).
  return prefix.some(word => word.startsWith("KUBECONFIG="));
}

// Global flags whose value is the next word, so it is not the subcommand.
const VALUE_FLAGS = new Set(["-n", "--namespace", "--context", "--kubeconfig", "--kube-context"]);

function firstSubcommand(words) {
  for (let index = 1; index < words.length; index += 1) {
    if (VALUE_FLAGS.has(words[index])) {
      index += 1;
    } else if (!words[index].startsWith("-")) {
      return words[index];
    }
  }
  return undefined;
}

export function findViolation(command) {
  for (const segment of splitSegments(command)) {
    const { words, prefix } = commandWords(segment);
    const tool = words[0]?.split("/").pop();
    if (tool !== "kubectl" && tool !== "helm") continue;

    const subcommand = firstSubcommand(words) ?? words[1];
    if (LOCAL_SUBCOMMANDS[tool].has(subcommand)) continue;
    if (namesTarget(tool, segment, prefix)) continue;

    return { tool, segment };
  }
  return null;
}


/** True unless the user switched the guard off (AGENT_TOOLS_GUARD=off). */
export function guardEnabled(env = process.env) {
  return env.AGENT_TOOLS_GUARD !== "off";
}

/** The message shown to the model when a command is blocked. */
export function denialReason(violation) {
  return (
    `Blocked: \`${violation.tool}\` without an explicit target. ` +
    "Pass --kubeconfig <absolute path>" +
    `${violation.tool === "helm" ? " (or --kube-context)" : ""} on every call, ` +
    "using the dev target the project documents, and confirm it with " +
    "`kubectl --kubeconfig <path> config current-context` first. " +
    "See the safe-operations skill. Offending segment: " + violation.segment
  );
}
