import path from "node:path";
import { fileURLToPath } from "node:url";
import { createExtension } from "../../packages/pi-agent-tools-extension/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Development adapter: runs the shipped extension directly against the
// repository's core/ assets, instead of the copies bundled into
// packages/pi-agent-tools-extension, so editable Pi installs pick up
// changes under core/ without a rebuild.
const CORE = path.resolve(__dirname, "..", "..", "core");

export default createExtension(CORE);
