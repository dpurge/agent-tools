---
name: security-review
description: Assess code and design for security risks — threat modeling, common vulnerability classes, secure defaults — and report findings by severity with practical remediation.
version: 1.0.0
---

# Security Review Skill

## Purpose

Identify realistic security risks in a change or design and recommend fixes that
teams can actually implement. Think like an attacker; communicate like an
engineer. Prioritize practical risk over theoretical concerns.

Use this skill when reviewing:

- authentication and authorization changes
- handling of secrets, tokens, or sensitive data
- external integrations and untrusted input
- new dependencies
- infrastructure and deployment configuration

## Review Process

1. Understand the context

- What are the valuable assets and trust boundaries?
- What are the entry points and who can reach them?

2. Threat model

Consider spoofing, tampering, repudiation, information disclosure, denial of
service, and privilege escalation.

3. Inspect common vulnerability classes

- **Input handling** — injection (SQL, shell, HTML), missing validation.
- **AuthN/AuthZ** — broken access control, missing authorization checks,
  insecure direct object references, privilege escalation.
- **Secrets** — hardcoded credentials, secrets in logs or errors, weak storage.
- **Data protection** — sensitive data exposure, excessive data in responses.
- **Dependencies** — known-vulnerable or unnecessary packages.
- **Configuration** — insecure defaults, environment separation, over-broad
  permissions.

4. Prioritize by real-world risk

Weigh exploitability and impact. Skip theoretical issues without realistic
impact.

## Severity Levels

- **Critical** — RCE, authentication bypass, sensitive data exposure. Fix now.
- **High** — privilege escalation, exploitable injection, broken access control.
- **Medium** — weak validation, missing controls, risky configuration.
- **Low** — defense-in-depth and hardening opportunities.

## Output Format

# Summary

High-level security assessment.

# Findings

For each finding:

Severity: Critical | High | Medium | Low
Location: <file and line reference>
Risk: <what is wrong and how it is exploited>
Impact: <what an attacker gains>
Recommendation: <concrete, implementable fix>

# Remediation Plan

Order fixes by risk reduction, then implementation effort.

## Principles

- Prefer prevention over detection.
- Minimize trust assumptions and blast radius.
- Never expose secret values; mask them as `[REDACTED:<type>]`.
- Recommend secure-by-default solutions.
