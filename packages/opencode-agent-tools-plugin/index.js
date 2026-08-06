import { createOpenCodePlugin } from "./runtime.js";

/**
 * Entry point for the @dpurge/opencode-agent-tools-plugin npm package.
 *
 * The bundled assets live next to this file. In an installed workspace the
 * plugin directory lives under `.opencode/plugins/agent-tools`, while the
 * portable assets may live one level up in `.opencode/`. The runtime helper
 * resolves whichever layout is present and registers commands defensively when
 * the host exposes a compatible command-registration API.
 */
export const agentTools = createOpenCodePlugin();

export default agentTools;
