# Operations and Targets

Commands that touch a cluster, a cloud account, a container runtime or a
database act on whatever target they resolve, and the default is often the
wrong one: a shell's default configuration may include production.

## Name the target

- Pass the target explicitly on every command: `kubectl` and `helm` with
  `--kubeconfig <absolute path>` (plus `--context` and `-n` when they matter),
  `gcloud` with `--project` (and `--account`), `aws` with `--profile` and
  `--region`, `docker` with `--context`, `terraform` with its workspace,
  database clients with host and database name.
- Never rely on environment variables (`KUBECONFIG`, `AWS_PROFILE`,
  `CLOUDSDK_CORE_PROJECT`, `DOCKER_HOST`), the "current" context or a default
  config: they differ per shell. Use absolute paths, because a relative path
  stops resolving after a `cd`.
- Before the first mutating command of a session, print the effective target
  with the same explicit flags (for example `kubectl ... config current-context`,
  `docker --context ... info`, `gcloud ... config list`) and compare it with
  what the project documents. Stop on a mismatch. Use the dev targets the
  project records (its constitution or README), not ones you guessed.
- Prefer the project's task runner (Make, Task, npm scripts): it pins the
  target for you.

## Read before you write

- Start read-only: `get`, `describe`, `logs`, `list`, `--dry-run`, `plan`,
  `helm template`. Mutate only after the read-only view looks right.
- Production or any shared target only on the user's explicit request, named
  in the request. If the intended target is unreachable, say so; never try
  another context, account or project.
- After a command or script fails halfway, inspect the state it left before
  retrying: many deploy scripts are not atomic.

## Hygiene

- Read secrets into shell variables inside the command that uses them. Never
  print them, write them into the repo, or put them in a prompt.
- Stop every background process you started (port-forwards, servers) and check
  the port is free afterwards. Kill by your own command line, not by a broad
  pattern.
- Give network, cluster and long-running commands a timeout, and poll with a
  bounded loop. When one times out, report it instead of retrying silently.
- Send long output to a file and read the tail or grep for errors.

For per-tool patterns and a pre-flight checklist, use the `safe-operations`
skill.
