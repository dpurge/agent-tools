---
description: Plan, design, and build a feature with human review gates — research, questions, architecture, approval, implementation, tests.
argument-hint: <what you want to build>
---

# Feature Development

Deliver the feature described below through six short phases. Move top to bottom.
**Do not skip the two approval gates** — wait for an explicit "approved" from the
user before crossing them.

**Feature request:** $ARGUMENTS

If the request is empty, ask the user what they want to build before continuing.

---

## 1. Understand & research

Use the `researcher` agent (read-only) to gather context:

- What problem is being solved, who uses it, what does success look like?
- Which files, modules, and dependencies are affected?
- What existing patterns and conventions should this follow?

Summarize findings with references (`path:line`). Note unknowns explicitly.

## 2. Ask questions

Before designing, resolve the ambiguities that would change the outcome.

- Ask up to ~5 focused, high-impact questions (scope, then security, UX, details).
- One decision per question; include a safe default for each.
- If the user doesn't know, record it as an assumption and continue.

Do not proceed with unresolved **critical** unknowns.

## 3. Design the architecture

Use the `architect` agent with the `architecture-review` and `security-review`
skills to produce:

- The approach: components, data flow, interfaces, and changes.
- Key decisions with trade-offs, and the alternatives considered.
- Risks, security implications, and the testing strategy.
- An ordered implementation plan (steps, affected files).

Keep it as simple as the requirements allow.

## 4. 🚦 Approval gate — plan

Present the design, plan, and open assumptions to the user. Summarize as a short
narrative, not a raw dump. **Stop and wait** for explicit approval. Treat any
questions or edits as review feedback; iterate until approved.

## 5. Implement

Use the `engineer` agent to build the approved plan:

- Follow repository conventions and the toolkit's `coding-style` rules.
- Keep changes focused and within the approved scope.
- Keep the build green; report real results.
- Self-review with the `code-review` skill; if security-sensitive, apply
  `security-review`. Have the `reviewer` agent inspect the change.

## 6. Test & validate

Use the `engineer` agent to add and run tests:

- Cover the acceptance criteria and important edge cases.
- Tests must be isolated, deterministic, and idempotent.
- Run the full build and test suite; confirm no regressions.

## 7. 🚦 Approval gate — delivery

Present the implementation, review findings, and test results. **Stop and wait**
for explicit approval before considering the feature done. Then summarize:

- What changed and why
- How it was validated
- Any follow-up work or known limitations

---

**Scope discipline:** if the work grows well beyond the original request, pause
and confirm with the user before expanding.
