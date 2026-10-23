import assert from "node:assert/strict";
import test, { after } from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const HOOK = path.join(process.cwd(), "adapters", "claude-code", "hooks", "closeout-guard.mjs");

const ROADMAP = `---
version: 1
status: approved
updated: 2026-09-16
---

# Roadmap

## Now
NOW_LINE

## Next
n

## Later
l

## Out of scope
o
`;

const FEATURE = `---
title: Add login
kind: feature
status: done
version: 1
updated: 2026-09-16
---

# Add login

## Problem / Motivation
p

## Acceptance Criteria
a

## Approach
ap

## Affected Areas
aa

## Out of Scope
oos

## Implementation Notes
Done.

## Validation
Done.

## Documentation Review
Done.

## Documentation Updates
Done.
`;

const NOW_LINE = "- Add login — specs/features/login.md";
const CLOSEOUT_MESSAGE = /closed feature still listed in Now: login/;

function git(cwd, ...args) {
  const result = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false", ...args], {
    cwd,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
}

/** A throwaway git repo with a committed specs dir; removed by the caller. */
async function makeRepo({ now = NOW_LINE, specsDirName = "specs", commit = true } = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-closeout-"));
  git(dir, "init", "-q");
  if (specsDirName) {
    const specs = path.join(dir, specsDirName);
    await fs.mkdir(path.join(specs, "features"), { recursive: true });
    await fs.writeFile(path.join(specs, "roadmap.md"), ROADMAP.replace("NOW_LINE", now));
    await fs.writeFile(path.join(specs, "features", "login.md"), FEATURE);
    if (commit) {
      git(dir, "add", "-A");
      git(dir, "commit", "-q", "-m", "init");
    }
  }
  return dir;
}

async function touchSpecs(dir) {
  await fs.appendFile(path.join(dir, "specs", "features", "login.md"), "\nEdited.\n");
}

// Every hook run keeps its session state here, never in the real tmp state.
const STATE_DIR = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-closeout-state-"));
after(() => fs.rm(STATE_DIR, { recursive: true, force: true }));

function runHook(payload, { env = {}, hook = HOOK } = {}) {
  return spawnSync(process.execPath, [hook], {
    input: typeof payload === "string" ? payload : JSON.stringify(payload),
    encoding: "utf8",
    env: { ...process.env, AGENT_TOOLS_CLOSEOUT: "", AGENT_TOOLS_CLOSEOUT_STATE_DIR: STATE_DIR, ...env },
  });
}

async function withRepo(options, fn) {
  const dir = await makeRepo(options);
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("closeout hook lets a session end when there is no specs directory", async () => {
  await withRepo({ specsDirName: null }, async dir => {
    const result = runHook({ cwd: dir });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
  });
});

test("closeout hook lets a session end when the changed specs are clean", async () => {
  await withRepo({ now: "- something in flight" }, async dir => {
    await touchSpecs(dir);
    const result = runHook({ cwd: dir });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
  });
});

test("closeout hook blocks with exit 2 and the reason when a closed feature is still in Now", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    const result = runHook({ cwd: dir, stop_hook_active: false });
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, CLOSEOUT_MESSAGE);
    assert.match(result.stderr, /Close the feature before finishing: fix the lines above \(see \/code B5 Closeout checklist\)\. Set AGENT_TOOLS_CLOSEOUT=off to disable this check\./);
    assert.doesNotMatch(result.stderr, /\u001b/);
  });
});

test("closeout hook blocks on a done spec that still has a Not started. section", async () => {
  await withRepo({ now: "- something in flight" }, async dir => {
    const file = path.join(dir, "specs", "features", "login.md");
    await fs.writeFile(file, FEATURE.replace("## Validation\nDone.", "## Validation\nNot started."));
    const result = runHook({ cwd: dir });
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /status is done but section 'Validation'/);
  });
});

test("closeout hook blocks on a late done spec with no CI/release decision", async () => {
  await withRepo({ now: "- something in flight" }, async dir => {
    const file = path.join(dir, "specs", "features", "login.md");
    await fs.writeFile(file, FEATURE.replace("updated: 2026-09-16", "updated: 2026-10-24"));
    const result = runHook({ cwd: dir });
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /Documentation Review has no CI\/release decision/);
  });
});

test("closeout hook does not block on validator findings outside the closeout errors", async () => {
  await withRepo({ now: "- something in flight" }, async dir => {
    await fs.writeFile(path.join(dir, "specs", "features", "login.md"), FEATURE.replace("kind: feature", "kind: nonsense"));
    const result = runHook({ cwd: dir });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
  });
});

test("closeout hook ignores a problem in specs that git shows as untouched", async () => {
  await withRepo({}, async dir => {
    const result = runHook({ cwd: dir });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
  });
});

test("closeout hook finds the specs root from a subdirectory of the repository", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    await fs.mkdir(path.join(dir, "src"));
    assert.equal(runHook({ cwd: path.join(dir, "src") }).status, 2);
  });
});

test("closeout hook does nothing when stop_hook_active is true, so it never loops", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    const result = runHook({ cwd: dir, stop_hook_active: true });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
  });
});

test("closeout hook does nothing when AGENT_TOOLS_CLOSEOUT=off", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    const result = runHook({ cwd: dir }, { env: { AGENT_TOOLS_CLOSEOUT: "off" } });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
  });
});

test("closeout hook never blocks when it cannot verify: no validator, no git, bad input", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);

    // A copy with no validator at any candidate path.
    const lonely = path.join(dir, "..", `closeout-lonely-${path.basename(dir)}`, "a", "b", "c");
    await fs.mkdir(lonely, { recursive: true });
    const copy = path.join(lonely, "closeout-guard.mjs");
    await fs.copyFile(HOOK, copy);
    try {
      assert.equal(runHook({ cwd: dir }, { hook: copy }).status, 0);
    } finally {
      await fs.rm(path.join(lonely, "..", "..", ".."), { recursive: true, force: true });
    }

    // No git on PATH: the hook cannot tell whether specs changed.
    const noGit = runHook({ cwd: dir }, { env: { PATH: path.join(dir, "no-such-bin") } });
    assert.equal(noGit.status, 0, noGit.stderr);

    assert.equal(runHook("not json").status, 0);
    assert.equal(runHook({}).status, 0);
  });
});

const ANSI = /\u001b\[/;

test("closeout hook stress: 20 runs of one session and one error block exactly once", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    const statuses = [];
    for (let i = 0; i < 20; i += 1) {
      statuses.push(runHook({ cwd: dir, session_id: "stress-1", stop_hook_active: false }).status);
    }
    assert.equal(statuses.filter(status => status === 2).length, 1, statuses.join(","));
    assert.equal(statuses.filter(status => status === 0).length, 19, statuses.join(","));
    assert.equal(statuses[0], 2);
    console.log(`stress statuses: ${statuses.join(",")}`);
  });
});

test("closeout hook never blocks more than twice per session, even for different errors", async () => {
  await withRepo({ now: "- something in flight" }, async dir => {
    const file = path.join(dir, "specs", "features", "login.md");
    const run = () => runHook({ cwd: dir, session_id: "cap-1" });

    await fs.writeFile(file, FEATURE.replace("## Validation\nDone.", "## Validation\nNot started."));
    assert.equal(run().status, 2);
    await fs.writeFile(file, FEATURE.replace("## Implementation Notes\nDone.", "## Implementation Notes\nNot started."));
    assert.equal(run().status, 2);
    await fs.writeFile(file, FEATURE.replace("## Approach\nap", "## Approach\nNot started."));
    const third = run();
    assert.equal(third.status, 0, third.stderr);
    assert.equal(third.stderr, "");
  });
});

test("closeout hook blocks again in a different session", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    assert.equal(runHook({ cwd: dir, session_id: "sess-a" }).status, 2);
    assert.equal(runHook({ cwd: dir, session_id: "sess-a" }).status, 0);
    assert.equal(runHook({ cwd: dir, session_id: "sess-b" }).status, 2);
  });
});

test("closeout hook keys by cwd when there is no session_id, and stays capped", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    const statuses = Array.from({ length: 5 }, () => runHook({ cwd: dir }).status);
    assert.deepEqual(statuses, [2, 0, 0, 0, 0]);
  });
});

test("closeout hook sanitises the session_id used as a file name", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    const sessionId = `../../evil/${"x".repeat(100)}`;
    assert.equal(runHook({ cwd: dir, session_id: sessionId }).status, 2);
    const files = await fs.readdir(STATE_DIR);
    const created = files.filter(name => name.startsWith("evil"));
    assert.equal(created.length, 1, files.join(","));
    assert.match(created[0], /^[A-Za-z0-9_-]{1,64}\.json$/);
  });
});

test("closeout hook lets the session end when the state directory is unwritable", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    const blocker = path.join(dir, "not-a-dir");
    await fs.writeFile(blocker, "file");
    const result = runHook(
      { cwd: dir, session_id: "unwritable" },
      { env: { AGENT_TOOLS_CLOSEOUT_STATE_DIR: path.join(blocker, "state") } },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
  });
});

test("closeout hook lets the session end when the state file is corrupt", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    const stateDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-tools-closeout-corrupt-"));
    try {
      for (const content of ["{not json", '{"blocks":"x","seen":1}']) {
        await fs.writeFile(path.join(stateDir, "corrupt.json"), content);
        const result = runHook(
          { cwd: dir, session_id: "corrupt" },
          { env: { AGENT_TOOLS_CLOSEOUT_STATE_DIR: stateDir } },
        );
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stderr, "");
      }
    } finally {
      await fs.rm(stateDir, { recursive: true, force: true });
    }
  });
});

test("closeout hook bounds the message to 1200 characters and counts the errors it hides", async () => {
  await withRepo({ now: "- something in flight" }, async dir => {
    for (let i = 0; i < 50; i += 1) {
      const name = `feature-with-a-rather-long-name-${String(i).padStart(2, "0")}-${"z".repeat(200)}`;
      await fs.writeFile(
        path.join(dir, "specs", "features", `${name}.md`),
        FEATURE.replace("## Validation\nDone.", "## Validation\nNot started."),
      );
    }
    const result = runHook({ cwd: dir, session_id: "big" });
    assert.equal(result.status, 2, result.stderr);
    assert.ok(result.stderr.length <= 1200, `length ${result.stderr.length}`);
    assert.match(result.stderr, /\(and \d+ more; run validate-specs\)/);
    assert.match(result.stderr, /Close the feature before finishing/);
    assert.doesNotMatch(result.stderr, ANSI);
  });
});

test("closeout hook reports the number of hidden errors exactly", async () => {
  await withRepo({ now: "- something in flight" }, async dir => {
    for (let i = 0; i < 8; i += 1) {
      await fs.writeFile(
        path.join(dir, "specs", "features", `f${i}.md`),
        FEATURE.replace("## Validation\nDone.", "## Validation\nNot started."),
      );
    }
    const result = runHook({ cwd: dir, session_id: "count" });
    assert.equal(result.status, 2, result.stderr);
    assert.equal(result.stderr.split("\n").filter(line => line.includes("status is done but section")).length, 5);
    assert.match(result.stderr, /\(and 3 more; run validate-specs\)/);
  });
});

test("closeout hook never repeats the exact same message in a session", async () => {
  await withRepo({}, async dir => {
    await touchSpecs(dir);
    const first = runHook({ cwd: dir, session_id: "repeat" });
    const second = runHook({ cwd: dir, session_id: "repeat" });
    assert.equal(first.status, 2);
    assert.equal(second.status, 0);
    assert.equal(second.stderr, "");
  });
});
