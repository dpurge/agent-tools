---
name: safe-operations
description: Run kubectl, helm, docker, gcloud, aws, terraform and database commands against the intended target and no other — explicit target flags, a pre-flight check, read-only first, bounded commands, secret handling, deploy verification and cleanup. Use before the first command that touches a cluster, cloud account, container runtime or database, and whenever deploying or migrating.
version: 1.0.0
---

# Safe Operations

## Purpose

An operations command acts on whatever target it resolves. Defaults are the
usual cause of a command hitting the wrong place: a shell's default
`KUBECONFIG`, current context, cloud profile or docker daemon can include
production, and they differ between shells. This skill makes the target
explicit, the first look read-only, and the cleanup complete. The short rule
(`operations`) says what to do; this skill says how.

## Pre-flight card

Fill this in, in your notes, before the first mutating command of a task:

- **Intended target:** its name, and where the project documents it (a
  constitution, README or task runner). If nothing documents it, ask.
- **Effective target:** the output of the identity command below, run with the
  same explicit flags you will use for the real commands.
- **Match:** yes or no. On "no" stop and report; do not adjust until it matches.
- **Mutations planned:** one line each.
- **Cleanup owed:** background processes, scratch databases, temp files.

Shell state does not persist between separate tool calls, so repeat the flags
in every command, or define them at the top of the same command:

```sh
K=(kubectl --kubeconfig=/absolute/path/kubeconfig)   # bash/zsh array
"${K[@]}" config current-context
"${K[@]}" -n my-namespace get pods
```

## Kubernetes

- Identity: `kubectl --kubeconfig=<abs> config current-context`, then a cheap
  read such as `get nodes`. A connection error here is a finding to report.
- Read-only first: `get`, `describe`, `logs --tail=100`, `top`, and
  `apply --dry-run=server -o yaml` or `diff` to preview a change.
- Project a secret without printing it, idempotently:
  `kubectl create secret generic NAME --from-env-file=FILE --dry-run=client -o yaml | kubectl apply -f -`
- Wait with a bound: `rollout status deployment/NAME --timeout=120s`,
  `wait --for=condition=complete job/NAME --timeout=120s`.
- Read a secret value into a variable and never print it:
  `V=$(kubectl ... get secret NAME -o jsonpath='{.data.KEY}' | base64 -d)`;
  check `${#V}` if you need to know it is not empty.
- A database session through `kubectl exec` can use the pod's own credentials
  (`sh -c '... "$DB_USER" ...'` inside the pod), so you never read them.
- Which version runs: compare the pod's `imageID` digest with the registry's
  digest. Tags such as `:dev` and `:latest` are mutable, and
  `imagePullPolicy: Always` makes a restart pull whatever the tag points to now.
- Port-forward lifecycle: start it in the background with explicit flags,
  record the PID, wait for the port with a bounded loop (`nc -z`), and stop it
  by PID when you finish. If the port is already served by someone else's
  forward, use it; do not kill it.
- A cluster that failed to start after a long stop: read the container state
  and the last log lines, wait until it reports ready, then re-run the
  idempotent start command. Never delete and recreate it: that loses its data.

## Helm

- `helm template` and `helm lint` are local and safe. `helm upgrade --dry-run`
  and `helm diff` contact the cluster: pass `--kubeconfig` (or `--kube-context`)
  and `--namespace` explicitly.
- Render, then feed the rendered config to the application's own loader or
  validator before deploying. Helm ignores unknown value keys silently, so
  after renaming a value, grep the repo for the old name.
- Pre-upgrade hooks (migrations) run before the new pods and may be
  destructive: read what the hook does and check the data it touches first.
- Check a values file's line endings (`file values.yaml`) before a scripted
  edit, and check the diff stat afterwards.

## Docker and registries

- Which daemon: `docker context show`; name it with `--context` when several
  exist.
- Builds are noisy: `docker build --progress=plain ... > /tmp/build.log 2>&1;
  tail -n 40 /tmp/build.log`.
- Confirm what you pushed by digest, and never push to a registry the project
  does not use for this purpose.
- Clean up only what you created (use names or labels, `docker run --rm`);
  do not prune everything.
- Do not mount home directories or host credentials into test containers.

## Cloud CLIs (gcloud, aws, az)

- Name project, account or profile, and region on every command. See what is
  active with `gcloud config list` and `gcloud auth list`, `aws sts
  get-caller-identity --profile NAME`.
- Check that credentials work by exit code, without printing a token:
  `gcloud auth print-access-token --account=NAME >/dev/null 2>&1; echo $?`.
  Tokens expire (about an hour). If the login needs interaction, ask the user
  to run it themselves (for example with the `!` prefix in a Claude Code
  prompt); an agent cannot answer an interactive login.
- Prefer `describe` and `list`. Deletes, IAM changes and anything that creates
  billable resources need the user's explicit go-ahead; avoid `--quiet` on
  deletes.

## Databases

- Default to read-only sessions (PostgreSQL:
  `PGOPTIONS='-c default_transaction_read_only=on'`).
- Before a destructive migration: count the affected rows read-only, try the
  migration in a transaction (`BEGIN; ...; ROLLBACK;`) or on a scratch
  database, and take a dump only when the data matters. Delete dumps when done:
  they can hold sensitive data.
- Scratch databases get a clearly temporary name, are created and dropped in
  the same task, and you list databases afterwards to confirm they are gone.
  Tests that wipe a database run only against a scratch one.

## Deploy flows

- Run the project's own deploy command rather than its steps by hand. When it
  fails midway, list which steps already ran (they may have changed the target)
  and say whether what is running is still consistent. Do not re-run blindly.
- After a deploy: rollout status; pods ready with zero restarts; startup log
  lines for warnings; one real request through the path users take; the
  applied config identical to the repository's (diff); the version by digest.
- Before an upgrade note the previous image or revision, so rollback is a
  known command.

## When the target is unreachable or behaves oddly

Report the symptom with its evidence (exit code, last log lines). Do not
switch to another target, and do not reach for destructive recovery. Ask.

## Cleanup checklist (end of every task)

- Background processes stopped and their ports free.
- Scratch databases dropped; test data you created deleted.
- Temp scripts, outputs and screenshots removed; no credentials in any file.
- `git status` shows only the changes you meant to make.
