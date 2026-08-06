import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/**
 * Portable assets (skills, agents, workflows, commands) are bundled next to
 * this file by the build. When installed into a `.pi` workspace the extension
 * lives at `.pi/extensions/agent-tools` and the assets sit one level up in
 * `.pi`. Resolve whichever layout actually contains the assets.
 */
const ASSET_DIRS = ["skills", "agents", "workflows", "commands"];

export function resolveAssetRoot(base = HERE) {
  const candidates = [base, path.resolve(base, "..", "..")];
  for (const candidate of candidates) {
    if (ASSET_DIRS.some(dir => fs.existsSync(path.join(candidate, dir)))) {
      return candidate;
    }
  }
  return base;
}

export function listDirectories(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

export function listMarkdown(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".md"))
    .map(entry => entry.name.replace(/\.md$/, ""))
    .sort();
}

/** Skills are directories (each with SKILL.md); agents/workflows/commands are markdown files. */
export function loadComponents(root = resolveAssetRoot()) {
  return {
    root,
    skills: listDirectories(path.join(root, "skills")),
    agents: listMarkdown(path.join(root, "agents")),
    workflows: listMarkdown(path.join(root, "workflows")),
    commands: listMarkdown(path.join(root, "commands")),
  };
}

export function readCommand(root, name) {
  const file = path.join(root, "commands", `${name}.md`);
  if (!fs.existsSync(file)) {
    return null;
  }
  return fs.readFileSync(file, "utf8");
}

export function renderCommandPrompt(body, args = "") {
  const request = String(args).trim();
  return body
    .replaceAll("$ARGUMENTS", request)
    .replaceAll("$AGENT_TOOLS_ROOT", skillRootForPrompt());
}

function skillRootForPrompt() {
  return path.join(resolveAssetRoot(), "skills");
}

/**
 * Build the Pi extension entry point. Exported as a factory so it can be
 * exercised in tests against a fixture asset root.
 */
export function createExtension(root = resolveAssetRoot()) {
  const components = loadComponents(root);

  return function agentToolsExtension(pi) {
    const notify = (message, ctx) => {
      if (typeof ctx?.ui?.notify === "function") {
        ctx.ui.notify(message, "info");
        return;
      }
      if (typeof pi?.ui?.notify === "function") {
        pi.ui.notify(message, "info");
        return;
      }
      console.log(message);
    };

    pi.registerCommand("agent-tools", {
      description: "Show available agent-tools components",
      async handler(args, ctx) {
        notify(
          [
            "agent-tools loaded",
            "",
            `Skills: ${components.skills.join(", ") || "none"}`,
            `Agents: ${components.agents.join(", ") || "none"}`,
            `Workflows: ${components.workflows.join(", ") || "none"}`,
            `Commands: ${components.commands.join(", ") || "none"}`,
          ].join("\n"),
          ctx
        );
      },
    });

    pi.registerCommand("skills", {
      description: "List agent-tools skills",
      async handler(args, ctx) {
        notify(components.skills.length ? components.skills.join("\n") : "No skills installed", ctx);
      },
    });

    pi.registerCommand("agents", {
      description: "List agent-tools agents",
      async handler(args, ctx) {
        notify(components.agents.length ? components.agents.join("\n") : "No agents installed", ctx);
      },
    });

    pi.registerCommand("workflows", {
      description: "List agent-tools workflows",
      async handler(args, ctx) {
        notify(components.workflows.length ? components.workflows.join("\n") : "No workflows installed", ctx);
      },
    });

    // Register one command per file in commands/, skipping names that would
    // collide with the listing commands above.
    const reserved = new Set(["agent-tools", "skills", "agents", "workflows"]);
    const registered = ["agent-tools", "skills", "agents", "workflows"];

    for (const name of components.commands) {
      if (reserved.has(name)) {
        continue;
      }

      pi.registerCommand(name, {
        description: `Run the ${name} command`,
        async handler(args = "", ctx) {
          const body = readCommand(root, name);
          if (!body) {
            notify(`${name} command is not installed`, ctx);
            return;
          }
          const prompt = renderCommandPrompt(body, args);
          if (ctx?.isIdle?.() === false) {
            pi.sendUserMessage(prompt, { deliverAs: "followUp" });
            notify("Command queued as follow-up", ctx);
            return;
          }
          pi.sendUserMessage(prompt);
        },
      });

      registered.push(name);
    }

    return {
      name: "agent-tools",
      commands: registered,
      components,
    };
  };
}

export default createExtension();
