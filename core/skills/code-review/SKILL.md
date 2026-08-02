---
name: code-review
description: Perform a structured code review focused on correctness, maintainability, security, performance, and engineering practices.
version: 1.0.0
---

# Code Review Skill

## Purpose

Review source code changes and provide actionable feedback that improves software quality.

Use this skill when reviewing:

- pull requests
- commits
- patches
- refactors
- new features
- bug fixes
- critical code paths

## Review Process

Follow these steps:

1. Understand the change

Determine:

- What problem is being solved?
- What behavior is changing?
- What are the expected outcomes?
- What assumptions are being made?

2. Review correctness

Check:

- Does the implementation satisfy the requirements?
- Are edge cases handled?
- Are error conditions handled correctly?
- Could this introduce regressions?
- Are tests sufficient?

3. Review design quality

Evaluate:

- readability
- simplicity
- separation of concerns
- naming
- abstractions
- duplication
- maintainability

4. Review security

Look for:

- injection vulnerabilities
- authentication issues
- authorization flaws
- insecure defaults
- sensitive data exposure
- unsafe dependency usage

5. Review performance

Consider:

- unnecessary computation
- inefficient algorithms
- database/query issues
- memory usage
- blocking operations
- scalability concerns

6. Review testing

Evaluate:

- test coverage
- test quality
- missing scenarios
- regression protection
- reliability of test assumptions

## Severity Levels

Classify findings using:

### Critical

Must be fixed before merging.

Examples:

- security vulnerabilities
- data corruption risks
- production-breaking defects

### High

Should be fixed before merging.

Examples:

- incorrect behavior
- major maintainability problems
- missing important validation

### Medium

Should be addressed soon.

Examples:

- design issues
- missing tests
- performance concerns

### Low

Optional improvements.

Examples:

- style improvements
- minor refactoring opportunities

## Output Format

Provide:

# Summary

Brief overview of the change and overall quality.

# Findings

For each finding:

Severity: Critical|High|Medium|Low

Location:
<file and line reference>

Issue:
<what is wrong>

Impact:
<why it matters>

Recommendation:
<how to improve it>


# Positive Observations

Mention good decisions, patterns, or implementation choices.

# Suggested Improvements

List non-blocking improvements.

# Final Recommendation

Choose one:

- Approve
- Approve with minor changes
- Request changes
- Needs redesign

## Review Guidelines

- Focus on correctness and maintainability over personal preference.
- Explain why something should change.
- Suggest concrete improvements.
- Avoid nitpicking unless it affects readability or consistency.
- Consider the project's existing conventions.
- Do not propose large rewrites without clear justification.
- Distinguish bugs from opinions.

## Additional Checks

When relevant, inspect:

- dependency changes
- configuration changes
- database migrations
- API compatibility
- logging and monitoring
- deployment impact