import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSET_DIRS = ["skills", "agents", "workflows", "commands"];

export function resolveAssetRoot(base = HERE) {
  const candidates = [base, path.resolve(base, "..", "..")] ;
  for (const candidate of candidates) {
    if (ASSET_DIRS.some(dir => fs.existsSync(path.join(candidate, dir)))) {
      return candidate;
    }
  }
  return base;
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

export function readCommand(root, name) {
  const file = path.join(root, "commands", `${name}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

function resolveRegistrar(api) {
  if (typeof api?.registerCommand === "function") {
    return (name, config) => api.registerCommand(name, config);
  }
  if (typeof api?.command === "function") {
    return (name, config) => api.command(name, config);
  }
  if (typeof api?.registerSlashCommand === "function") {
    return (name, config) => api.registerSlashCommand(name, config);
  }
  if (typeof api?.slashCommand === "function") {
    return (name, config) => api.slashCommand(name, config);
  }
  if (typeof api?.addCommand === "function") {
    return (name, config) => api.addCommand(name, config);
  }
  if (typeof api?.addSlashCommand === "function") {
    return (name, config) => api.addSlashCommand(name, config);
  }
  if (typeof api?.plugin?.registerCommand === "function") {
    return (name, config) => api.plugin.registerCommand(name, config);
  }
  if (typeof api?.commands?.register === "function") {
    return (name, config) => api.commands.register(name, config);
  }
  return null;
}

export function createOpenCodePlugin(root = resolveAssetRoot()) {
  const commands = listMarkdown(path.join(root, "commands"));
  const reserved = new Set(["agent-tools", "skills", "agents", "workflows"]);

  return async function agentTools(api = {}) {
    const register = resolveRegistrar(api);
    const registered = [];

    if (register) {
      for (const name of commands) {
        if (reserved.has(name)) {
          continue;
        }

        register(name, {
          description: `Run the ${name} command`,
          async handler(args = "", ctx = {}) {
            const body = readCommand(root, name);
            const request = String(args || "").trim();
            const header = request ? `Request: ${request}\n\n` : "";
            const message = body ? header + body : `${name} command is not installed`;

            if (typeof ctx?.ui?.notify === "function") {
              ctx.ui.notify(message);
            }

            return message;
          },
        });

        registered.push(name);
      }
    }

    return {
      name: "agent-tools",
      commands: registered,
      assetRoot: root,
    };
  };
}
