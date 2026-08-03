#!/usr/bin/env node

//
// The `agent-tools` command. Thin wrapper that delegates to the scripts in this
// directory so each remains runnable on its own.
//

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Command } from "commander";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pkg = require("../package.json");

function run(script, args = []) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [path.join(HERE, script), ...args], {
      stdio: "inherit",
    });
    child.on("close", code => resolve(code ?? 0));
  });
}

const INSTALLERS = {
  claude: "install-claude.js",
  opencode: "install-opencode.js",
  pi: "install-pi.js",
};

const program = new Command();

program
  .name("agent-tools")
  .description("Portable AI agent toolkit for Claude Code, OpenCode, and Pi.")
  .version(pkg.version);

program
  .command("validate")
  .description("Validate the toolkit wiring")
  .action(async () => {
    process.exit(await run("validate.js"));
  });

program
  .command("build")
  .description("Assemble the platform packages from core/")
  .action(async () => {
    process.exit(await run("build.js"));
  });

program
  .command("install")
  .argument("<target>", "claude | opencode | pi")
  .option("-f, --force", "overwrite existing files")
  .option("-t, --target-dir <dir>", "install location", process.cwd())
  .description("Install agent-tools into a project")
  .action(async (target, options) => {
    const script = INSTALLERS[target];

    if (!script) {
      console.error(`Unknown target '${target}'. Use: claude, opencode, or pi.`);
      process.exit(1);
    }

    // Build first so bundled assets exist for the installer to copy.
    const buildCode = await run("build.js");
    if (buildCode !== 0) {
      process.exit(buildCode);
    }

    const args = [];
    if (options.force) {
      args.push("--force");
    }
    if (options.targetDir) {
      args.push(`--target=${options.targetDir}`);
    }

    process.exit(await run(script, args));
  });

await program.parseAsync(process.argv);
