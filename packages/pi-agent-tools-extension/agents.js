import fs from "node:fs";
import path from "node:path";

/**
 * Maps this toolkit's Claude-style tool names (as authored in
 * `core/agents/*.md`) to Pi's own built-in tool names. Pi has no `Glob`
 * equivalent; `find` is the closest built-in for path/pattern search.
 */
const TOOL_NAME_MAP = {
  Read: "read",
  Write: "write",
  Edit: "edit",
  Grep: "grep",
  Glob: "find",
  Bash: "bash",
};

/**
 * Minimal frontmatter reader for this toolkit's own agent files — not a
 * general YAML parser. It only needs to pull four top-level keys (`name`,
 * `description`, `model_preference`, `tools`) out of a known, consistently
 * authored shape; nested maps like `permissions:` are skipped, not parsed.
 */
export function parseAgentFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(content);
  if (!match) {
    return { attributes: {}, body: content };
  }

  const [, frontmatterText, body] = match;
  const attributes = {};
  let currentListKey = null;

  for (const rawLine of frontmatterText.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (!line.trim()) {
      continue;
    }

    const isIndented = /^\s/.test(line);

    if (!isIndented) {
      const colon = line.indexOf(":");
      if (colon === -1) {
        currentListKey = null;
        continue;
      }
      const key = line.slice(0, colon).trim();
      const rest = line.slice(colon + 1).trim();
      if (rest === "") {
        attributes[key] = [];
        currentListKey = key;
      } else {
        attributes[key] = stripQuotes(rest);
        currentListKey = null;
      }
      continue;
    }

    if (currentListKey && Array.isArray(attributes[currentListKey])) {
      const item = /^\s*-\s*(.+)$/.exec(line);
      if (item) {
        attributes[currentListKey].push(stripQuotes(item[1].trim()));
      }
    }
  }

  return { attributes, body: body.replace(/^\n+/, "") };
}

function stripQuotes(value) {
  const match = /^"(.*)"$/.exec(value) || /^'(.*)'$/.exec(value);
  return match ? match[1] : value;
}

function mapTools(tools) {
  if (!Array.isArray(tools) || tools.length === 0) {
    return undefined;
  }
  const mapped = tools.map(tool => TOOL_NAME_MAP[tool]).filter(Boolean);
  return mapped.length > 0 ? mapped : undefined;
}

/**
 * Read one `core/agents/<name>.md`-shaped file into the shape Pi's subagent
 * dispatch needs: `{ name, description, tools, model, systemPrompt }`.
 * Returns null for a missing or malformed file rather than throwing, so one
 * bad agent file doesn't take discovery down with it.
 */
export function loadAgentConfig(root, name) {
  const file = path.join(root, "agents", `${name}.md`);
  let content;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }

  const { attributes, body } = parseAgentFrontmatter(content);
  if (typeof attributes.name !== "string" || typeof attributes.description !== "string") {
    return null;
  }

  const modelPreference = Array.isArray(attributes.model_preference) ? attributes.model_preference : [];

  return {
    name: attributes.name,
    description: attributes.description,
    tools: mapTools(attributes.tools),
    // No host here implements model_preference's fallback list — take the
    // first choice; leaving it undefined lets the subagent inherit whatever
    // model the dispatching session is already using.
    model: modelPreference[0],
    systemPrompt: body.trim(),
  };
}

/** List and load every agent under `<root>/agents`, skipping unparsable files. */
export function discoverAgents(root) {
  const dir = path.join(root, "agents");
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const agents = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }
    const config = loadAgentConfig(root, entry.name.replace(/\.md$/, ""));
    if (config) {
      agents.push(config);
    }
  }

  return agents.sort((a, b) => a.name.localeCompare(b.name));
}
