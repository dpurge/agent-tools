---
name: release
description: Workflow for preparing, validating, documenting, and delivering software releases safely.
version: 1.0.0
agents:
  - backend-expert
  - frontend-expert
  - security-reviewer
skills:
  - code-review
  - architecture-review
---

# Release Workflow

## Purpose

Provide a consistent process for preparing software releases with confidence, including validation, risk assessment, documentation, and operational readiness.

This workflow helps teams deliver changes safely and reduce release-related failures.

## When to Use

Use this workflow when:

- preparing a production release
- creating a versioned release
- deploying major changes
- publishing packages
- completing a milestone

## Workflow Steps

## 1. Review Release Scope

Collect:

- included changes
- related issues
- completed features
- bug fixes
- known limitations

Identify:

- affected systems
- affected users
- breaking changes
- migration requirements

Confirm:

- release goals
- expected outcomes
- ownership responsibilities

## 2. Analyze Changes

Review:

- changed files
- architecture impact
- dependency updates
- configuration changes
- database changes

Use:

- `repo-analyzer` tool when available
- `architecture-review` skill
- `code-review` skill

Evaluate:

- maintainability
- reliability
- security
- compatibility

## 3. Perform Security Review

Use:

- `security-reviewer` agent

Check:

- authentication changes
- authorization changes
- sensitive data handling
- dependency vulnerabilities
- exposed configuration

Verify:

- secrets are not included
- security controls remain effective
- production configuration is safe

## 4. Validate Quality

Run:

- automated tests
- integration tests
- build checks
- static analysis
- dependency checks

Confirm:

- expected behavior
- no regressions
- acceptable performance

Review:

- error handling
- logging
- monitoring readiness

## 5. Prepare Release Artifacts

Create or update:

- version information
- release notes
- changelog entries
- migration instructions
- deployment documentation

Verify:

- package metadata
- generated artifacts
- documentation links
- installation instructions

## 6. Prepare Deployment

Confirm:

- deployment steps
- environment configuration
- database migrations
- infrastructure changes
- rollback procedure

Define:

- deployment owner
- verification steps
- rollback triggers

## 7. Execute Release

During release:

- follow deployment plan
- monitor system health
- verify critical workflows
- record unexpected issues

Check:

- application availability
- error rates
- performance metrics
- user-facing behavior

## 8. Post-Release Verification

Validate:

- release is available
- integrations work correctly
- monitoring is active
- users can complete critical workflows

Review:

- logs
- alerts
- support feedback

## 9. Document Release

Produce:

```text
Version:
Release Date:
Summary:
Changes:
Breaking Changes:
Migration Notes:
Known Issues:
Rollback Plan:

Capture:

lessons learned
follow-up improvements
operational observations
Output Format

Final release report:

Release Summary

Overview of delivered changes.

Changes Included

List features, fixes, and improvements.

Validation

Describe tests and verification.

Security Review

Summarize security checks.

Deployment

Describe deployment process and status.

Post-Release Actions

List monitoring results and follow-ups.

Success Criteria

The workflow is complete when:

release scope is confirmed
changes are reviewed
security risks are assessed
validation passes
deployment plan exists
release documentation is complete
post-release checks succeed