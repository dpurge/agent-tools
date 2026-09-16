#!/usr/bin/env node

//
// Validates the specs/ directory of a project against the strict formats
// defined by the `constitution-format`, `feature-spec-format`, and
// `memory-format` skills. Unlike scripts/validate.js (which checks this
// toolkit's own core/ wiring), this checks a *consumer* project's specs/ —
// defaults to the current working directory, overridable with --target=<dir>,
// matching the installer scripts' convention.
//
// The constants below are the machine-checkable mirror of those three
// skills' prose. Keep both in sync by hand when a format changes.
//

import fs from "node:fs/promises";
import path from "node:path";
import matter from "front-matter";
import { parseInstallerArgs } from "./lib/install-common.js";

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

let errors = [];
let warnings = [];

function error(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function ok(message) {
  console.log(`${COLORS.green}✓${COLORS.reset} ${message}`);
}

function fail(message) {
  console.log(`${COLORS.red}✗${COLORS.reset} ${message}`);
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const CONSTITUTION_SECTIONS = {
  "mission.md": ["Problem", "Users", "Value proposition", "Non-goals"],
  "tech-stack.md": [
    "Languages & runtimes",
    "Frameworks & libraries",
    "Infrastructure & tooling",
    "Key conventions",
  ],
  "roadmap.md": ["Now", "Next", "Later", "Out of scope"],
};

const CONSTITUTION_STATUSES = new Set(["draft", "approved"]);

const FEATURE_SECTIONS = [
  "Problem / Motivation",
  "Acceptance Criteria",
  "Approach",
  "Affected Areas",
  "Out of Scope",
  "Implementation Notes",
  "Validation",
  "Documentation Review",
  "Documentation Updates",
];

const FEATURE_STATUSES = new Set([
  "draft",
  "approved",
  "implementing",
  "validating",
  "documenting",
  "done",
]);

const FEATURE_KINDS = new Set(["feature", "bugfix"]);

const MEMORY_HEADER = [
  "# Project Memory",
  "",
  "<!-- Append-only, one entry per line: `YYYY-MM-DDTHH:MM:SSZ [tag] text`. See the `memory-format` skill. Do not read this file in full — grep it. -->",
  "",
];

const MEMORY_TAGS = new Set(["build", "convention", "decision", "domain", "env", "gotcha"]);

const MEMORY_ENTRY_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[([a-z]+)\] (.+)$/;

const MEMORY_MAX_LINE = 200;
const MEMORY_MAX_ENTRIES = 200;

// Control characters (Cc, e.g. a bare \r) and format characters (Cf, which
// includes zero-width spaces/joiners and bidirectional-override characters
// like U+202E RIGHT-TO-LEFT OVERRIDE) can make a line render in a diff or
// terminal as something other than what the model actually reads — reject
// them outright rather than trying to enumerate every code point.
const UNSAFE_CHAR_RE = /[\p{Cc}\p{Cf}]/u;

// Named so a match can be reported (pattern name + type + line number)
// without ever echoing the matched text itself into an error message. `type`
// is the tag used in the `[REDACTED:<type>]` marker in the error message.
const UNSAFE_PATTERNS = [
  { name: "GitHub token", type: "GITHUB_TOKEN", re: /\bghp_[A-Za-z0-9]{20,}\b/ },
  { name: "GitHub fine-grained token", type: "GITHUB_TOKEN", re: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: "AWS access key ID", type: "AWS_KEY", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Slack token", type: "SLACK_TOKEN", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: "private key block", type: "PRIVATE_KEY", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "API secret key", type: "API_KEY", re: /\bsk-(ant-)?[A-Za-z0-9_-]{20,}\b/ },
  { name: "password assignment", type: "PASSWORD", re: /\bpassword\s*[:=]\s*\S+/i },
  { name: "API key assignment", type: "API_KEY", re: /\bapi[_-]?key\s*[:=]\s*\S+/i },
  { name: "email address", type: "PII", re: /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i },
  { name: "IPv4 address", type: "IP_ADDRESS", re: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/ },
];

// Narrower than "starts with /" on purpose — a bare leading slash also
// matches ordinary URL paths (e.g. "/api/users"), which are not a
// portability problem. Only flag the actual risk: machine-specific homes
// and system directories, plus Windows drive paths and `~/`. The delimiter
// class covers not just whitespace/start-of-line but also being wrapped in
// backticks, quotes, parens, or brackets — a path doesn't stop being an
// absolute path just because a memory entry quotes it as code.
// Matches start-of-line, whitespace, or a wrapping quote/backtick/paren/
// bracket/angle-bracket — a path doesn't stop being an absolute path just
// because a memory entry quotes it as code or wraps it in a markdown link.
const NONPORTABLE_DELIM = "(^|[\\s\"'`(\\[<])";
const NONPORTABLE_PATTERNS = [
  { name: "home-directory reference (~/)", re: new RegExp(`${NONPORTABLE_DELIM}~[/\\\\]`) },
  { name: "Windows drive path", re: /\b[A-Za-z]:[\\/]/ },
  {
    name: "absolute path under a machine-specific directory",
    re: new RegExp(
      `${NONPORTABLE_DELIM}/(Users|home|root|var|tmp|etc|opt|mnt|private|usr|srv|data|app|workspace|media|Volumes|Library|Applications)/`
    ),
  },
];

function extractHeadings(body) {
  return [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map(m => m[1].trim());
}

function checkSections(label, body, required) {
  const headings = extractHeadings(body);
  const matches = headings.length === required.length && headings.every((h, i) => h === required[i]);
  if (!matches) {
    error(
      `${label}: sections must be exactly ${JSON.stringify(required)} in order — found ${JSON.stringify(headings)}`
    );
  }
}

function checkVersionAndDate(label, attributes) {
  if (!Number.isInteger(attributes.version) || attributes.version < 1) {
    error(`${label}: frontmatter 'version' must be a positive integer (got ${JSON.stringify(attributes.version)})`);
  }

  // An unquoted `YYYY-MM-DD` scalar is valid YAML 1.1 and gets auto-coerced
  // to a native Date by the parser rather than staying a string — accept
  // both forms instead of forcing authors to remember to quote the date.
  const updated = attributes.updated;
  const isValidDateString = typeof updated === "string" && DATE_RE.test(updated);
  const isValidDateObject = updated instanceof Date && !Number.isNaN(updated.getTime());
  if (!isValidDateString && !isValidDateObject) {
    error(`${label}: frontmatter 'updated' must be an ISO date YYYY-MM-DD (got ${JSON.stringify(updated)})`);
  }
}

async function readFrontmatter(label, file) {
  const raw = await fs.readFile(file, "utf8");
  try {
    return matter(raw);
  } catch (e) {
    error(`${label}: could not parse frontmatter (${e.message})`);
    return null;
  }
}

async function validateConstitutionFile(specsDir, name, labelPrefix) {
  const file = path.join(specsDir, name);
  if (!(await exists(file))) {
    return;
  }
  const label = `${labelPrefix}${name}`;

  const parsed = await readFrontmatter(label, file);
  if (!parsed) {
    return;
  }

  const attributes = parsed.attributes;
  const before = errors.length;
  checkVersionAndDate(label, attributes);
  if (!CONSTITUTION_STATUSES.has(attributes.status)) {
    error(
      `${label}: frontmatter 'status' must be one of ${[...CONSTITUTION_STATUSES].join("/")} (got ${JSON.stringify(attributes.status)})`
    );
  }
  checkSections(label, parsed.body, CONSTITUTION_SECTIONS[name]);
  if (errors.length === before) {
    ok(`${label} matches the constitution format`);
  }
}

async function validateFeatureFile(specsDir, file, labelPrefix) {
  const label = `${labelPrefix}features/${path.relative(path.join(specsDir, "features"), file)}`;

  const parsed = await readFrontmatter(label, file);
  if (!parsed) {
    return;
  }

  const attributes = parsed.attributes;
  const before = errors.length;
  checkVersionAndDate(label, attributes);
  if (typeof attributes.title !== "string" || !attributes.title.trim()) {
    error(`${label}: frontmatter 'title' must be a non-empty string`);
  }
  if (!FEATURE_KINDS.has(attributes.kind)) {
    error(`${label}: frontmatter 'kind' must be one of ${[...FEATURE_KINDS].join("/")} (got ${JSON.stringify(attributes.kind)})`);
  }
  if (!FEATURE_STATUSES.has(attributes.status)) {
    error(
      `${label}: frontmatter 'status' must be one of ${[...FEATURE_STATUSES].join("/")} (got ${JSON.stringify(attributes.status)})`
    );
  }
  checkSections(label, parsed.body, FEATURE_SECTIONS);
  if (errors.length === before) {
    ok(`${label} matches the feature-spec format`);
  }
}

function checkMemoryLines(label, lines) {
  // Record header problems but keep going — the entry region is still at a
  // fixed offset regardless of whether the header's content is right, and a
  // wrong header must never suppress secret/portability scanning of every
  // entry in the file.
  for (let i = 0; i < MEMORY_HEADER.length; i++) {
    if (lines[i] !== MEMORY_HEADER[i]) {
      error(`${label}: header line ${i + 1} does not match the required fixed header (see the memory-format skill)`);
    }
  }

  const entryLines = lines.slice(MEMORY_HEADER.length);
  // A trailing newline produces one empty trailing element — drop it rather
  // than treating end-of-file as a blank-line violation.
  if (entryLines.length && entryLines[entryLines.length - 1] === "") {
    entryLines.pop();
  }

  let entryCount = 0;
  let previousTimestamp = null;
  const seen = new Set();

  entryLines.forEach((line, idx) => {
    const lineNo = MEMORY_HEADER.length + idx + 1;

    if (line === "") {
      error(`${label}: line ${lineNo}: blank line between entries is not allowed`);
      return;
    }

    if (UNSAFE_CHAR_RE.test(line)) {
      error(
        `${label}: line ${lineNo}: contains a control, formatting, or bidirectional-override character — not allowed (can hide content from a human reviewing the diff)`
      );
      return;
    }

    if (line.length > MEMORY_MAX_LINE) {
      warn(`${label}: line ${lineNo}: entry exceeds ${MEMORY_MAX_LINE} characters`);
    }

    for (const { name, type, re } of UNSAFE_PATTERNS) {
      if (re.test(line)) {
        error(`${label}: line ${lineNo}: looks like it contains a ${name} [REDACTED:${type}] — remove it`);
        return;
      }
    }

    for (const { name, re } of NONPORTABLE_PATTERNS) {
      if (re.test(line)) {
        error(`${label}: line ${lineNo}: contains a non-portable reference (${name}) — use a repo-relative path instead`);
        return;
      }
    }

    const match = MEMORY_ENTRY_RE.exec(line);
    if (!match) {
      error(`${label}: line ${lineNo}: does not match 'YYYY-MM-DDTHH:MM:SSZ [tag] text'`);
      return;
    }

    const [, tag] = match;
    if (!MEMORY_TAGS.has(tag)) {
      error(`${label}: line ${lineNo}: tag '${tag}' is not one of ${[...MEMORY_TAGS].join("/")}`);
    }

    const timestamp = line.slice(0, 20);
    if (previousTimestamp && timestamp < previousTimestamp) {
      warn(`${label}: line ${lineNo}: timestamp is earlier than the previous entry's — out of order`);
    }
    previousTimestamp = timestamp;

    if (seen.has(line)) {
      warn(`${label}: line ${lineNo}: exact duplicate of an earlier entry`);
    }
    seen.add(line);

    entryCount++;
  });

  if (entryCount > MEMORY_MAX_ENTRIES) {
    warn(
      `${label}: ${entryCount} entries exceeds the ${MEMORY_MAX_ENTRIES}-entry threshold — a maintenance pass should purge/consolidate down to ~150 (see the memory-format skill)`
    );
  }
}

async function validateMemoryFile(specsDir, labelPrefix) {
  const file = path.join(specsDir, "memory.md");
  if (!(await exists(file))) {
    return;
  }
  const label = `${labelPrefix}memory.md`;

  const raw = await fs.readFile(file, "utf8");
  const lines = raw.split(/\r?\n/);

  const before = errors.length;
  checkMemoryLines(label, lines);
  if (errors.length === before) {
    ok(`${label} matches the memory format`);
  }
}

/**
 * Validate one specs directory directly — either a project's `specs/` or a
 * shadow `.agent/specs/` (see the `agent-workspace` rule). `labelPrefix` is
 * purely cosmetic, prepended to messages so output reads naturally
 * regardless of which one is being checked.
 */
export async function validateSpecsDir(specsDir, labelPrefix = "specs/") {
  errors = [];
  warnings = [];

  if (!(await exists(specsDir))) {
    return { errors, warnings, exists: false };
  }

  for (const name of Object.keys(CONSTITUTION_SECTIONS)) {
    await validateConstitutionFile(specsDir, name, labelPrefix);
  }

  await validateMemoryFile(specsDir, labelPrefix);

  const featuresDir = path.join(specsDir, "features");
  if (await exists(featuresDir)) {
    const entries = await fs.readdir(featuresDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        await validateFeatureFile(specsDir, path.join(featuresDir, entry.name), labelPrefix);
      }
    }
  } else {
    warn(`${labelPrefix}features/ does not exist yet — no feature specs to check.`);
  }

  return { errors, warnings, exists: true };
}

/** Convenience wrapper: validate `<targetDir>/specs`. */
export async function validateSpecs(targetDir) {
  const specsDir = path.join(targetDir, "specs");
  const result = await validateSpecsDir(specsDir, "specs/");
  if (!result.exists) {
    console.log("No specs/ directory yet — nothing to validate.");
  }
  return result;
}

function parseValidateSpecsArgs() {
  const { targetDir } = parseInstallerArgs();
  const args = process.argv.slice(2);
  const dirArg = args.find(a => a.startsWith("--dir="))?.split("=")[1];
  return dirArg ? path.resolve(dirArg) : path.join(targetDir, "specs");
}

async function main() {
  const specsDir = parseValidateSpecsArgs();
  const labelPrefix = path.basename(path.dirname(specsDir)) === ".agent" ? ".agent/specs/" : "specs/";

  console.log(`\nValidating specs at ${specsDir}...\n`);

  const { errors: foundErrors, warnings: foundWarnings, exists: dirExists } = await validateSpecsDir(
    specsDir,
    labelPrefix
  );

  if (!dirExists) {
    console.log("Directory does not exist yet — nothing to validate.");
    return;
  }

  console.log("");
  foundWarnings.forEach(w => console.log(`${COLORS.yellow}!${COLORS.reset} ${w}`));
  foundErrors.forEach(e => fail(e));
  console.log("");

  if (foundErrors.length) {
    console.log(`${COLORS.red}specs validation failed${COLORS.reset}: ${foundErrors.length} error(s)`);
    process.exit(1);
  }

  console.log(`${COLORS.green}specs validation successful${COLORS.reset}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
