import path from "node:path";
import { fileURLToPath } from "node:url";
import { createOpenCodePlugin } from "../../packages/opencode-agent-tools-plugin/runtime.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, "..", "..", "core");

export default createOpenCodePlugin(CORE);
