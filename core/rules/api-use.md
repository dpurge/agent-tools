# Using Library APIs

Do not write a call to a library, framework or CLI from memory: names,
signatures and options change between versions.

- Before you rely on an API, confirm it in the code the project installed, at
  the version it pinned: search the repository for existing uses, then print the
  signature with the language toolchain (`go doc`, `inspect`, the package's
  `.d.ts`, `javap`, `cargo doc`), and compile or run a small use of it.
- Label anything you could not confirm as "unverified" in your notes and in the
  report. Never present a guessed call as working.
- For the exact commands per language, use the `api-verification` skill.
