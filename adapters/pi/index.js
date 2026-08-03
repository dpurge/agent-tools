import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Development adapter: runs the extension directly against the repository's
// core/ assets. The shipped extension lives in
// packages/pi-agent-tools-extension and bundles its own copy of these assets.
const CORE = path.resolve(__dirname, "..", "..", "core");

function listDirectories(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".md"))
    .map(entry => entry.name.replace(/\.md$/, ""))
    .sort();
}

function readCommand(name) {
  const file = path.join(CORE, "commands", `${name}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

/**
 * Pi extension entry point (development adapter).
 *
 * Exposes the portable agent-tools assets to Pi without making Pi the source of
 * truth. Skills are directories; agents, workflows and commands are markdown
 * files.
 */
export default function agentToolsExtension(pi) {
  const skills = listDirectories(path.join(CORE, "skills"));
  const agents = listMarkdown(path.join(CORE, "agents"));
  const workflows = listMarkdown(path.join(CORE, "workflows"));
  const commands = listMarkdown(path.join(CORE, "commands"));

  const notify = message => pi.ui.notify(message);

  pi.registerCommand("agent-tools", {
    description: "Show available agent-tools components",
    async handler() {
      notify(
        [
          "agent-tools loaded",
          "",
          `Skills: ${skills.join(", ") || "none"}`,
          `Agents: ${agents.join(", ") || "none"}`,
          `Workflows: ${workflows.join(", ") || "none"}`,
          `Commands: ${commands.join(", ") || "none"}`,
        ].join("\n")
      );
    },
  });

  pi.registerCommand("skills", {
    description: "List agent-tools skills",
    async handler() {
      notify(skills.length ? skills.join("\n") : "No skills installed");
    },
  });

  pi.registerCommand("agents", {
    description: "List agent-tools agents",
    async handler() {
      notify(agents.length ? agents.join("\n") : "No agents installed");
    },
  });

  pi.registerCommand("workflows", {
    description: "List agent-tools workflows",
    async handler() {
      notify(workflows.length ? workflows.join("\n") : "No workflows installed");
    },
  });

  // Register one command per file in commands/, skipping names that would
  // collide with the listing commands above.
  const reserved = new Set(["agent-tools", "skills", "agents", "workflows"]);

  for (const name of commands) {
    if (reserved.has(name)) {
      continue;
    }

    pi.registerCommand(name, {
      description: `Run the ${name} command`,
      async handler(args = "") {
        const body = readCommand(name);
        if (!body) {
          notify(`${name} command is not installed`);
          return;
        }
        const request = String(args).trim();
        const header = request ? `Request: ${request}\n\n` : "";
        notify(header + body);
      },
    });
  }
}
