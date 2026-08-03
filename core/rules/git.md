# Git

## Commits

- Make small, coherent commits that each leave the tree in a working state.
- Write imperative, present-tense subjects: "Add release workflow", not "Added".
- Keep the subject under ~72 characters; explain the *why* in the body.
- Do not mix unrelated changes in one commit.
- Do not add tool or model attribution to commit messages.

## Branches

- Work on a feature branch, not directly on the default branch.
- Rebase or merge from the default branch before opening a pull request.

## Safety

- Never rewrite published history or force-push shared branches.
- Never commit secrets, credentials, or generated build artifacts.
- Treat `git reset --hard`, branch deletion, and history edits as destructive:
  confirm intent before running them.

## Pull requests

- Describe what changed and why; link related issues.
- Keep pull requests reviewable in size; split large work where possible.
