---
name: bug-investigation
description: Systematic workflow for investigating, diagnosing, and resolving software defects.
version: 1.0.0
agents:
  - backend-expert
  - frontend-expert
  - security-reviewer
skills:
  - code-review
  - architecture-review
---

# Bug Investigation Workflow

## Purpose

Provide a repeatable process for investigating software defects, identifying root causes, and delivering reliable fixes.

This workflow helps agents move from symptoms to verified solutions while minimizing unnecessary changes.

## When to Use

Use this workflow when:

- a bug has been reported
- behavior differs from expectations
- production issues require diagnosis
- regressions need investigation
- failures are difficult to reproduce

## Workflow Steps

## 1. Gather Context

Collect:

- issue description
- expected behavior
- actual behavior
- affected users or systems
- reproduction steps
- recent changes

Identify:

- when the problem started
- whether it is consistent
- whether it affects all environments

## 2. Reproduce the Issue

Attempt to:

- reproduce locally
- verify inputs
- isolate conditions
- identify minimal reproduction steps

Document:

- environment
- commands executed
- observed output
- error messages

## 3. Analyze the System

Use:

- `repo-analyzer` tool when available
- `architecture-review` skill
- `code-review` skill

Inspect:

- relevant code paths
- dependencies
- configuration
- external integrations
- recent commits

Identify:

- likely failure boundaries
- unexpected assumptions
- incorrect state transitions

## 4. Form Hypotheses

Create possible explanations.

For each hypothesis:

- describe the cause
- identify supporting evidence
- identify missing evidence
- define a verification method

Avoid changing code before understanding the failure.

## 5. Verify Root Cause

Confirm the cause by:

- adding diagnostics
- reproducing with controlled changes
- inspecting runtime behavior
- comparing expected and actual flows

The root cause should explain:

- why the issue occurs
- why it occurs in this location
- why existing safeguards did not prevent it

## 6. Design the Fix

Evaluate:

- smallest safe change
- long-term maintainability
- regression risks
- security implications
- performance impact

Prefer:

- fixing the root cause
- adding appropriate tests
- preserving existing behavior

Avoid:

- unrelated refactoring
- unnecessary abstractions
- hiding symptoms

## 7. Implement

During implementation:

- keep changes focused
- follow project conventions
- update tests
- update documentation when needed

Use appropriate agents:

- `backend-expert` for server-side issues
- `frontend-expert` for UI/client issues
- `security-reviewer` for security-related bugs

## 8. Validate

Verify:

- original reproduction case is fixed
- tests pass
- no regressions introduced
- performance is acceptable

Check:

- edge cases
- error handling
- deployment impact

## 9. Document Findings

Produce a summary:

```text
Problem:
Impact:
Root Cause:
Fix:
Tests Added:
Follow-up Actions:

Output Format

Final investigation report:

Bug Summary

Short description of the issue.

Investigation

Evidence collected and analysis performed.

Root Cause

Technical explanation.

Solution

Implemented fix and reasoning.

Validation

Tests and verification results.

Recommendations

Additional improvements if needed.

Success Criteria

The workflow is complete when:

root cause is identified
fix is implemented or clearly specified
regression risk is understood
validation steps are documented
```
