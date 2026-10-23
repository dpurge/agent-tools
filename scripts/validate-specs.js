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

import { realpathSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "front-matter";

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

let errors = [];
let warnings = [];
// Injectable so the staleness rule is testable; set per validateSpecsDir call.
let today = currentDate();

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

function currentDate() {
  return new Date().toISOString().slice(0, 10);
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

// Specs still being worked on must record the memory.md lookup in *Approach*;
// finished specs are exempt so old ones do not add warning noise.
const ACTIVE_FEATURE_STATUSES = new Set(["draft", "approved", "implementing", "validating", "documenting"]);

// A finished spec must not still carry the template placeholder in the
// sections that record the work; a long-open spec is flagged as stalled so a
// feature that was finished but never closed out does not look abandoned.
const CLOSEOUT_SECTIONS = ["Implementation Notes", "Validation", "Documentation Review", "Documentation Updates"];
const PLACEHOLDER_BODY = "Not started.";
const OPEN_WORK_STATUSES = new Set(["implementing", "validating", "documenting"]);
const STALLED_AFTER_DAYS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

// E3 (a done spec records its CI/release decision) applies only to specs
// updated on or after this date. It is a grandfathering date, not "today":
// specs finished before the rule existed carry no such record and need no edit.
const CI_REVIEW_REQUIRED_FROM = "2026-10-24";
const CI_DECISION_RE = /needs change:\s*(yes|no)/i;
const CI_NOT_APPLICABLE_RE = /^CI review: not applicable/m;

// Matches the feature-spec path in a roadmap `## Now` line, as written
// (`specs/features/<slug>.md`, possibly under another prefix or in backticks).
const NOW_FEATURE_PATH_RE = /(?:^|[\s`(<])((?:[^\s`)>]*\/)?features\/([A-Za-z0-9._-]+)\.md)/;

const MEMORY_HEADER = [
  "# Project Memory",
  "",
  "<!-- Append-only, one entry per line: `YYYY-MM-DDTHH:MM:SSZ [tag] text`. See the `memory-format` skill. Do not read this file in full — grep it. -->",
  "",
];

const MEMORY_TAGS = new Set(["build", "convention", "decision", "domain", "env", "gotcha"]);

const MEMORY_ENTRY_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \[([a-z]+)\] (.+)$/;

const MEMORY_MAX_LINE = 400;
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

function sectionText(body, heading) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex(line => line === `## ${heading}`);
  if (start === -1) {
    return "";
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => /^## /.test(line));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n");
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

/** Normalizes the `updated` frontmatter value (string or Date) to YYYY-MM-DD, or null. */
function toDateString(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  return typeof value === "string" && DATE_RE.test(value) ? value : null;
}

/**
 * Checks a roadmap's `## Now` lines against the feature specs they point to:
 * a spec that is already `done` must not stay listed (error), and a pointer
 * to a spec file that does not exist is suspicious (warning).
 */
async function checkNowLines(label, body, specsDir, projectRoot) {
  for (const line of sectionText(body, "Now").split(/\r?\n/)) {
    const match = NOW_FEATURE_PATH_RE.exec(line);
    if (!match) {
      continue;
    }
    const [, writtenPath, slug] = match;
    // The path is written repo-relative (`specs/features/x.md`); resolve it
    // against the specs root so a shadow `.agent/specs/` root works too.
    const candidates = [
      path.join(specsDir, writtenPath.replace(/^(?:\.agent\/)?specs\//, "")),
      path.join(projectRoot, writtenPath),
    ];
    let file = null;
    for (const candidate of candidates) {
      if (await exists(candidate)) {
        file = candidate;
        break;
      }
    }
    if (!file) {
      warn(`${label}: Now line points to a feature spec that does not exist: ${writtenPath}`);
      continue;
    }
    let status;
    try {
      status = matter(await fs.readFile(file, "utf8")).attributes.status;
    } catch {
      continue; // the feature file's own parse error is reported by validateFeatureFile
    }
    if (status === "done") {
      error(`${label}: closed feature still listed in Now: ${slug} (remove the line, /code B5)`);
    }
  }
}

/**
 * Shared schema check for every file that follows the constitution format
 * (frontmatter `version`/`status`/`updated` plus a fixed, ordered `##`
 * section list). Used both for the specs-root mission/tech-stack/roadmap
 * files and for every extra per-artifact roadmap file discovered via the
 * `### Artifacts` table, so the two call sites never drift into two copies
 * of the same checks.
 */
function checkConstitutionSchema(label, attributes, body, sectionsKey) {
  checkVersionAndDate(label, attributes);
  if (!CONSTITUTION_STATUSES.has(attributes.status)) {
    error(
      `${label}: frontmatter 'status' must be one of ${[...CONSTITUTION_STATUSES].join("/")} (got ${JSON.stringify(attributes.status)})`
    );
  }
  checkSections(label, body, CONSTITUTION_SECTIONS[sectionsKey]);
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

async function validateConstitutionFile(specsDir, name, labelPrefix, projectRoot) {
  const file = path.join(specsDir, name);
  if (!(await exists(file))) {
    return;
  }
  const label = `${labelPrefix}${name}`;

  const parsed = await readFrontmatter(label, file);
  if (!parsed) {
    return;
  }

  const before = errors.length;
  checkConstitutionSchema(label, parsed.attributes, parsed.body, name);
  if (name === "roadmap.md") {
    await checkNowLines(label, parsed.body, specsDir, projectRoot);
  }
  if (errors.length === before) {
    ok(`${label} matches the constitution format`);
  }
}

// Maps a `### Artifacts` table header cell (exact, trimmed name) to the key
// used on each parsed row object. Column order in the table doesn't matter;
// only the header names do. See the `constitution-format` skill's
// `### Artifacts` subsection for the full column semantics.
const ARTIFACTS_TABLE_COLUMNS = {
  Artifact: "artifact",
  Root: "root",
  Changelog: "changelog",
  Versioning: "versioning",
  Roadmap: "roadmap",
};

/** Splits one `| a | b |`-style markdown table row into trimmed cells. */
function splitTableRow(line) {
  const withoutEdgePipes = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return withoutEdgePipes.split("|").map(cell => cell.trim());
}

/**
 * Parses the markdown table directly under a `### Artifacts` heading inside
 * `tech-stack.md`'s body (see the `constitution-format` skill). Returns:
 *
 * - `null` if no `### Artifacts` heading exists — nothing declared, the
 *   implicit single-artifact default applies.
 * - `null` if the heading exists but no valid table follows it — an error
 *   is recorded via `error()` first, so this is never a silent no-op.
 * - otherwise, an array of row objects with only the keys for columns
 *   actually present in the table (e.g. `{ artifact, root, roadmap }` if
 *   the table has no `Changelog`/`Versioning` columns).
 */
function parseArtifactsTable(body) {
  const headingMatch = /^###\s+Artifacts\s*$/m.exec(body);
  if (!headingMatch) {
    return null;
  }

  const lines = body.slice(headingMatch.index + headingMatch[0].length).split(/\r?\n/);

  let i = 0;
  while (i < lines.length && lines[i].trim() === "") {
    i++;
  }

  const headerLine = lines[i];
  const separatorLine = lines[i + 1];
  if (!headerLine?.trim().startsWith("|") || !separatorLine?.trim().startsWith("|")) {
    error("tech-stack.md: '### Artifacts' heading found but no markdown table follows it");
    return null;
  }

  const headerCells = splitTableRow(headerLine);
  const columnIndex = {};
  headerCells.forEach((name, idx) => {
    const key = ARTIFACTS_TABLE_COLUMNS[name];
    if (key) {
      columnIndex[key] = idx;
    }
  });

  const rows = [];
  let lineNo = i + 2;
  while (lineNo < lines.length && lines[lineNo].trim().startsWith("|")) {
    const cells = splitTableRow(lines[lineNo]);
    if (cells.length !== headerCells.length) {
      error(
        `tech-stack.md: '### Artifacts' table row ${JSON.stringify(lines[lineNo].trim())} has ${cells.length} cell(s), expected ${headerCells.length}`
      );
      return null;
    }
    const row = {};
    for (const [key, idx] of Object.entries(columnIndex)) {
      row[key] = cells[idx];
    }
    rows.push(row);
    lineNo++;
  }

  return rows;
}

/**
 * Collects the distinct repo-relative `Roadmap` paths declared across the
 * `### Artifacts` table's rows, deduplicated against each other and against
 * the specs-root `roadmap.md`'s own repo-relative-to-`projectRoot` path (so
 * a row that just points back at the shared roadmap is never re-validated
 * as if it were an extra file).
 */
function discoverExtraRoadmapPaths(rows, specsDir, projectRoot) {
  const specsRootRoadmapPath = path.relative(projectRoot, path.join(specsDir, "roadmap.md"));
  const seen = new Set([specsRootRoadmapPath]);
  const discovered = [];

  for (const row of rows) {
    if (!("roadmap" in row)) {
      continue;
    }
    const cleaned = row.roadmap.trim().replace(/^`+|`+$/g, "").trim();
    if (!cleaned || seen.has(cleaned)) {
      continue;
    }
    seen.add(cleaned);
    discovered.push(cleaned);
  }

  return discovered;
}

/**
 * Validates one extra roadmap file discovered via the `### Artifacts`
 * table, against the exact same schema as the specs-root `roadmap.md`
 * (see `checkConstitutionSchema`). Labeled by its own repo-relative path
 * rather than a `labelPrefix`, since these files live outside `specs/`.
 */
async function validateExtraRoadmapFile(specsDir, projectRoot, relPath) {
  const file = path.join(projectRoot, relPath);
  const label = relPath;

  if (!(await exists(file))) {
    error(`${label}: roadmap file declared in tech-stack.md's '### Artifacts' table does not exist`);
    return;
  }

  const parsed = await readFrontmatter(label, file);
  if (!parsed) {
    return;
  }

  const before = errors.length;
  checkConstitutionSchema(label, parsed.attributes, parsed.body, "roadmap.md");
  await checkNowLines(label, parsed.body, specsDir, projectRoot);
  if (errors.length === before) {
    ok(`${label} matches the roadmap format`);
  }
}

/**
 * Discovers and validates every extra per-artifact roadmap file declared in
 * `tech-stack.md`'s `### Artifacts` table (see the `constitution-format`
 * skill and the `multi-artifact-roadmaps` feature spec). A no-op when
 * `tech-stack.md` doesn't exist, has no `### Artifacts` heading, or has one
 * with no `Roadmap` column — the common case, zero behavior change.
 */
async function validateDeclaredRoadmaps(specsDir, projectRoot) {
  const techStackFile = path.join(specsDir, "tech-stack.md");
  if (!(await exists(techStackFile))) {
    return;
  }

  const raw = await fs.readFile(techStackFile, "utf8");
  let body;
  try {
    body = matter(raw).body;
  } catch {
    // Already reported by validateConstitutionFile's own frontmatter read
    // for this same file — avoid a duplicate error for the same problem.
    return;
  }

  const rows = parseArtifactsTable(body);
  if (!rows) {
    return;
  }

  for (const relPath of discoverExtraRoadmapPaths(rows, specsDir, projectRoot)) {
    await validateExtraRoadmapFile(specsDir, projectRoot, relPath);
  }
}

/** E2 (done specs carry no placeholder sections), E3 (done specs record the CI/release decision) and W1 (open work is not stalled). */
function checkFeatureCloseout(label, slug, attributes, body) {
  if (attributes.status === "done") {
    for (const section of CLOSEOUT_SECTIONS) {
      if (sectionText(body, section).trim() === PLACEHOLDER_BODY) {
        error(`${label}: status is done but section '${section}' is still "${PLACEHOLDER_BODY}"`);
      }
    }

    // Compares the spec's own `updated` date, never `today`, so the result does not change over time.
    const updated = toDateString(attributes.updated);
    const review = sectionText(body, "Documentation Review");
    if (updated && updated >= CI_REVIEW_REQUIRED_FROM && !CI_DECISION_RE.test(review) && !CI_NOT_APPLICABLE_RE.test(review)) {
      error(
        `${label}: status is done but Documentation Review has no CI/release decision (add "{file, needs change: yes/no, reason}" per changed or checked file, or "CI review: not applicable (reason)")`
      );
    }
  }

  if (OPEN_WORK_STATUSES.has(attributes.status)) {
    const updated = toDateString(attributes.updated);
    if (updated && (Date.parse(today) - Date.parse(updated)) / DAY_MS > STALLED_AFTER_DAYS) {
      warn(`${label}: stalled: ${slug} has been ${attributes.status} since ${updated}; finish B3-B5 or say why`);
    }
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
  if (ACTIVE_FEATURE_STATUSES.has(attributes.status) && !/^Memory consulted:/m.test(sectionText(parsed.body, "Approach"))) {
    warn(
      `${label}: Approach has no "Memory consulted:" line — grep memory.md for the affected area or tag and record the pattern and what it found (or "none relevant")`
    );
  }
  checkFeatureCloseout(label, path.basename(file, ".md"), attributes, parsed.body);
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
 * regardless of which one is being checked. `projectRoot` is where
 * repo-relative paths declared in `tech-stack.md`'s `### Artifacts` table
 * (e.g. extra `Roadmap` files) are resolved against — it is *not* always
 * `path.dirname(specsDir)`: that's only true for a normal `specs/` root,
 * not for a shadow `.agent/specs/` root, whose project root is two
 * directories up. The default here only covers the normal case; callers
 * that might see a shadow root (like `main()`) must compute and pass it
 * explicitly.
 */
export async function validateSpecsDir(
  specsDir,
  labelPrefix = "specs/",
  projectRoot = path.dirname(specsDir),
  options = {}
) {
  errors = [];
  warnings = [];
  today = options.today ?? currentDate();

  if (!(await exists(specsDir))) {
    return { errors, warnings, exists: false };
  }

  for (const name of Object.keys(CONSTITUTION_SECTIONS)) {
    await validateConstitutionFile(specsDir, name, labelPrefix, projectRoot);
  }

  await validateDeclaredRoadmaps(specsDir, projectRoot);

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
export async function validateSpecs(targetDir, options = {}) {
  const specsDir = path.join(targetDir, "specs");
  const result = await validateSpecsDir(specsDir, "specs/", targetDir, options);
  if (!result.exists) {
    console.log("No specs/ directory yet — nothing to validate.");
  }
  return result;
}

function parseValidateSpecsArgs() {
  const args = process.argv.slice(2);
  const targetDir = args.find(a => a.startsWith("--target="))?.split("=")[1] ?? process.cwd();
  const dirArg = args.find(a => a.startsWith("--dir="))?.split("=")[1];
  const specsDir = dirArg ? path.resolve(dirArg) : path.join(path.resolve(targetDir), "specs");
  // --today / VALIDATE_SPECS_TODAY exist so the staleness check is testable.
  const todayArg = args.find(a => a.startsWith("--today="))?.split("=")[1] ?? process.env.VALIDATE_SPECS_TODAY;
  if (todayArg !== undefined && !DATE_RE.test(todayArg)) {
    throw new Error(`--today / VALIDATE_SPECS_TODAY must be YYYY-MM-DD (got ${JSON.stringify(todayArg)})`);
  }
  return { specsDir, today: todayArg };
}

async function main() {
  const { specsDir, today: todayOption } = parseValidateSpecsArgs();
  const isShadowRoot = path.basename(path.dirname(specsDir)) === ".agent";
  const labelPrefix = isShadowRoot ? ".agent/specs/" : "specs/";
  // A shadow `.agent/specs/` root's project root is two directories up
  // (past both `specs` and `.agent`); a normal `specs/` root's is one.
  const projectRoot = isShadowRoot ? path.dirname(path.dirname(specsDir)) : path.dirname(specsDir);

  console.log(`\nValidating specs at ${specsDir}...\n`);

  const { errors: foundErrors, warnings: foundWarnings, exists: dirExists } = await validateSpecsDir(
    specsDir,
    labelPrefix,
    projectRoot,
    { today: todayOption }
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

// Compare real paths: the script is also reached through symlinks (editable
// installs link skill directories) and a plain URL comparison would then skip
// main() and silently validate nothing.
function isRunDirectly() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isRunDirectly()) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
