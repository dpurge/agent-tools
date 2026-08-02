---
name: feature-development
description: End-to-end workflow for planning, designing, implementing, testing, and delivering new software features.
version: 1.0.0
agents:
  - backend-expert
  - frontend-expert
  - security-reviewer
skills:
  - architecture-review
  - code-review
---

# Feature Development Workflow

## Purpose

Provide a structured process for delivering new features with appropriate technical design, implementation quality, security considerations, and maintainability.

This workflow helps agents move from requirements to production-ready changes.

## When to Use

Use this workflow when:

- implementing a new feature
- extending existing functionality
- introducing a new service or component
- modifying significant application behavior
- adding integrations

## Workflow Steps

## 1. Understand Requirements

Gather:

- business goal
- user expectations
- acceptance criteria
- constraints
- affected systems

Clarify:

- what problem is being solved
- who uses the feature
- what success looks like

Identify:

- functional requirements
- non-functional requirements
- dependencies
- risks

## 2. Analyze Existing System

Use:

- `repo-analyzer` tool when available
- `architecture-review` skill

Review:

- repository structure
- existing architecture
- related components
- coding conventions
- current patterns

Identify:

- integration points
- reusable components
- affected modules
- potential conflicts

## 3. Design the Solution

Create a technical approach covering:

- architecture changes
- data flow
- API changes
- UI changes
- configuration changes
- deployment considerations

Consider:

- maintainability
- scalability
- reliability
- security
- operational impact

Prefer:

- existing patterns
- minimal complexity
- incremental changes

## 4. Select Specialists

Use appropriate agents:

### backend-expert

For:

- APIs
- databases
- services
- distributed systems
- server-side logic

### frontend-expert

For:

- user interfaces
- components
- state management
- browser behavior
- accessibility

### security-reviewer

For:

- authentication
- authorization
- sensitive data
- external integrations
- threat analysis

## 5. Plan Implementation

Define:

- files to modify
- new components
- migration steps
- testing strategy
- rollout approach

Break work into:

1. preparation
2. implementation
3. validation
4. documentation

## 6. Implement

During development:

- follow repository conventions
- keep changes focused
- reuse existing abstractions
- avoid unnecessary refactoring

Include:

- automated tests
- error handling
- logging where appropriate
- documentation updates

## 7. Review Changes

Run:

- `code-review` skill
- `architecture-review` skill

Check:

- correctness
- maintainability
- security
- performance
- compatibility

Review:

- edge cases
- failure scenarios
- backwards compatibility

## 8. Validate

Verify:

- acceptance criteria are met
- tests pass
- feature works in realistic scenarios
- existing functionality is preserved

Check:

- user experience
- accessibility
- security controls
- operational readiness

## 9. Prepare Delivery

Document:

- implementation summary
- configuration changes
- deployment requirements
- migration steps
- known limitations

Prepare:

- release notes
- operational notes
- rollback plan if needed

## Output Format

Final feature report:

# Feature Summary

Describe the feature and intended outcome.

# Technical Design

Explain architecture and implementation approach.

# Implementation

List major changes.

# Testing

Describe validation performed.

# Security Considerations

Document security review and mitigations.

# Deployment Notes

Include operational requirements.

# Follow-up Work

List future improvements.

## Success Criteria

The workflow is complete when:

- requirements are understood
- solution design is documented
- implementation is reviewed
- tests validate behavior
- security risks are addressed
- feature is ready for delivery