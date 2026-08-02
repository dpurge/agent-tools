import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const ROOT = path.resolve(__dirname, "../..");

function loadJson(file) {
  if (!fs.existsSync(file)) {
    return {};
  }

  return JSON.parse(
    fs.readFileSync(file, "utf8")
  );
}

function listDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

/**
 * Pi extension entry point.
 *
 * This adapter exposes the portable agent-tools
 * assets to Pi without making Pi the source of truth.
 */
export default function agentToolsExtension(pi) {
  const skillsDir =
    path.join(ROOT, "core", "skills");

  const workflowsDir =
    path.join(ROOT, "core", "workflows");

  const agentsDir =
    path.join(ROOT, "core", "agents");

  const skills =
    listDirectory(skillsDir);

  const workflows =
    listDirectory(workflowsDir);

  const agents =
    listDirectory(agentsDir);


  pi.registerCommand(
    "agent-tools",
    {
      description:
        "Show available agent-tools components",

      async handler() {
        pi.ui.notify(
          [
            "agent-tools loaded",
            "",
            `Skills: ${skills.join(", ") || "none"}`,
            `Agents: ${agents.join(", ") || "none"}`,
            `Workflows: ${workflows.join(", ") || "none"}`
          ].join("\n")
        );
      }
    }
  );


  pi.registerCommand(
    "skills",
    {
      description:
        "List agent-tools skills",

      async handler() {
        pi.ui.notify(
          skills.length
            ? skills.join("\n")
            : "No skills installed"
        );
      }
    }
  );


  pi.registerCommand(
    "workflows",
    {
      description:
        "List agent-tools workflows",

      async handler() {
        pi.ui.notify(
          workflows.length
            ? workflows.join("\n")
            : "No workflows installed"
        );
      }
    }
  );


  pi.registerCommand(
    "agents",
    {
      description:
        "List agent-tools agents",

      async handler() {
        pi.ui.notify(
          agents.length
            ? agents.join("\n")
            : "No agents installed"
        );
      }
    }
  );
}