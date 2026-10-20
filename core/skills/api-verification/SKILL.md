---
name: api-verification
description: Confirm that a library function, type, flag or config key really exists, at the version the project uses, before writing code that depends on it — read the installed package's own interfaces with the language toolchain (go doc, inspect, .d.ts, javap, cargo doc), prove it compiles, and label anything unconfirmed. Use before writing or reviewing code that calls a library or framework API, and whenever you are about to rely on memory for a signature.
version: 1.0.0
---

# API Verification

## Purpose

Memory of a library goes stale: functions get renamed, options move, defaults
change, and a plausible call that does not exist is the most common way
generated code fails. The ground truth is the code the project actually
installed, at the version it actually pinned. It is on disk, it needs no
network or third-party service, and the language toolchain can print it. Use it
before you write the call, not after the build breaks.

## The ladder (stop at the first rung that answers)

1. **The project's own use.** Search the repository for existing calls of the
   same API. A call that already compiles and ships is better evidence than any
   recollection. Match its style.
2. **The installed interface.** Print the signature from the installed
   package (recipes below). This is authoritative for what exists.
3. **Prove it.** Write the smallest snippet that uses the API and compile,
   type-check or run it in a scratch directory. A signature you read but never
   compiled is still a claim.
4. **Official documentation for that version.** Only for behaviour the
   signature cannot show (semantics, defaults, deprecations). Fetch the
   project's own docs or changelog, pinned to the installed version, and quote
   the page you used.
5. **Otherwise say it is unverified.** Write "unverified: <what, and why>" in
   your notes and in the report, and do not present it as fact.

## Find the version first

Read it from the lockfile or manifest, not from memory: `go.mod` and
`go list -m MODULE`, `package.json` with `package-lock.json` or
`npm ls PACKAGE`, `pip show PACKAGE`, `Cargo.lock`, `pom.xml` or the Gradle
lockfile. Docs for another version can describe a different API.

## Recipes (each was run before it was written down)

| Language | Print the interface | Read the source |
|---|---|---|
| Go | `go doc PKG`, `go doc PKG.Symbol`, `go doc -all PKG` | `go doc -src PKG.Symbol`; `go list -m -f '{{.Dir}} {{.Version}}' MODULE` inside the module prints where the source lives |
| Python | `python -m pydoc MODULE.name`, or `python -c "import inspect, MODULE; print(inspect.signature(MODULE.name))"` | `inspect.getsource(MODULE.name)` |
| TypeScript / JavaScript | Find the type file: the `types` entry under `exports["."]` (or top-level `types`) in `node_modules/PKG/package.json`, else `find node_modules/PKG -name "*.d.ts"`; then `grep -n "name(" FILE.d.ts` | the package's `lib/` or `dist/` |
| Java / Kotlin | `javap -classpath JAR_OR_DIR CLASS` (add `-public` or `-private` as needed) | the sources jar, if present |
| Rust | `cargo doc --no-deps -p CRATE` and open the page, or read `~/.cargo/registry/src/*/CRATE-VERSION/` | same directory |

Run these from the project directory so the project's own versions resolve.
For a package that is not installed yet, install it into a scratch directory
first (never into the project without the user's go-ahead), then read it.

## Common traps

- **Same name, different package or major version** (`v2` import paths,
  `@scope/pkg` forks, two packages with one name). Check the import path.
- **Deprecated but present:** the signature exists, the docs say not to use
  it. Look for a deprecation note beside the declaration.
- **Config and CLI flags are APIs too.** Verify them the same way: the tool's
  own `--help` or schema, or the project's existing config, not recollection.
- **Generated or dynamic APIs** (ORMs, RPC clients, proxies) do not show
  members in source. Build the project's generation step first, then read the
  output.
- **A search result or a model's answer is not the installed package.** Treat
  both as leads to check on disk.

## Report

For each external API you relied on, give: name, version, how you confirmed it
(the command, or the file and line), and whether you compiled a use of it. List
everything you could not confirm under "unverified". Never write a library call
in a report as working if you did not confirm it.
