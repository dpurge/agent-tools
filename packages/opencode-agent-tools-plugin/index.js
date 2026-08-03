/**
 * Entry point for the @dpurge/opencode-agent-tools-plugin npm package.
 *
 * The portable assets (skills, agents, commands, rules) are shipped as markdown
 * and consumed by OpenCode directly. This plugin registers no runtime hooks; it
 * exists so the package has a valid entry point and can be extended later.
 *
 * See: https://opencode.ai/docs/plugins/
 */
export const agentTools = async () => ({});

export default agentTools;
