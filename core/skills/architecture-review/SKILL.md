---
name: architecture-review
description: Analyze software architecture, identify design risks, evaluate trade-offs, and recommend improvements.
version: 1.0.0
---

# Architecture Review Skill

## Purpose

Review a software system's architecture to identify strengths, weaknesses, risks, and improvement opportunities.

Use this skill when evaluating:

- system architecture
- application structure
- service boundaries
- API design
- data flow
- scalability
- maintainability
- security implications
- technical debt

## Review Process

Follow these steps:

1. Understand the system context
   - What problem does the system solve?
   - Who are the users?
   - What are the main constraints?
   - What technologies are involved?

2. Map the architecture
   - Identify major components.
   - Identify dependencies.
   - Identify data flows.
   - Identify external integrations.

3. Evaluate architectural qualities

Review:

### Maintainability

Consider:

- separation of concerns
- modularity
- coupling
- cohesion
- code ownership boundaries
- ease of change

### Scalability

Consider:

- bottlenecks
- horizontal scaling options
- state management
- caching
- asynchronous processing
- database limitations

### Reliability

Consider:

- failure modes
- retries
- error handling
- observability
- disaster recovery

### Security

Consider:

- authentication
- authorization
- data protection
- secrets management
- attack surfaces

### Performance

Consider:

- latency
- throughput
- resource usage
- expensive operations

## Output Format

Produce an architecture review with:

# Architecture Summary

Brief description of the current design.

# Strengths

List architectural decisions that are effective.

# Risks

List identified problems with:

- severity
- impact
- affected components
- evidence

# Recommendations

For each recommendation include:

- proposed change
- expected benefit
- implementation considerations
- trade-offs

# Future Considerations

Identify areas requiring monitoring or future redesign.

## Guidelines

- Prefer evidence-based observations over assumptions.
- Do not recommend technology changes without a clear benefit.
- Consider existing constraints before suggesting rewrites.
- Prefer incremental improvements over unnecessary redesign.
- Explain trade-offs explicitly.
- Separate critical issues from optimization opportunities.

## Related Resources

When available, consult:

- architecture diagrams
- API documentation
- deployment configuration
- infrastructure definitions
- database schemas
- monitoring data
