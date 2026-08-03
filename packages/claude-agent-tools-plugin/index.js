/**
 * Entry point for the @dpurge/claude-agent-tools-plugin npm package.
 *
 * Claude Code loads this plugin through its `plugin.json` manifest (generated
 * by the repository build), which points at the bundled skills, agents,
 * commands, workflows, and MCP configs. This module exists so the package has a
 * valid JavaScript entry for `import`/`require` and exposes package metadata to
 * programmatic consumers.
 */
export const name = "@dpurge/claude-agent-tools-plugin";

export default { name };
