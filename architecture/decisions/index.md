# Architecture Decision Records

Key architectural decisions and their rationale.

## What are ADRs?

Architecture Decision Records (ADRs) document important architectural decisions made during the project, including the context, decision, and consequences.

## Format

Each ADR follows this structure:

- **Status** - Proposed, Accepted, Deprecated, Superseded
- **Context** - The issue we're trying to solve
- **Decision** - What we decided to do
- **Consequences** - The results of this decision

## Decisions

### Core Decisions

- [ADR 001: useFetch vs useAsyncData →](/architecture/decisions/001-useFetch-vs-useAsyncData)
- [ADR 002: Callback System →](/architecture/decisions/002-callback-system)
- [ADR 003: Server Composables →](/architecture/decisions/003-server-composables)
- [ADR 004: Type Generation →](/architecture/decisions/004-type-generation)

## Decision Index

| # | Title | Status | Date |
|---|-------|--------|------|
| 001 | useFetch vs useAsyncData | Accepted | 2024-01 |
| 002 | Callback System | Accepted | 2024-01 |
| 003 | Server Composables | Accepted | 2024-02 |
| 004 | Type Generation | Accepted | 2024-02 |

## Creating New ADRs

When making significant architectural decisions:

1. **Create New File** - `architecture/decisions/XXX-title.md`
2. **Use Template** - Follow ADR format
3. **Document Context** - Explain the problem
4. **Record Decision** - What was chosen and why
5. **Note Consequences** - Both positive and negative

### ADR Template

```markdown
# ADR XXX: Title

**Status:** Proposed | Accepted | Deprecated | Superseded

**Date:** YYYY-MM-DD

## Context

What is the issue we're trying to solve?

## Decision

What decision did we make?

## Consequences

What are the results of this decision?

### Positive
- Benefit 1
- Benefit 2

### Negative
- Drawback 1
- Drawback 2

## Alternatives Considered

- Alternative 1 - Why not chosen
- Alternative 2 - Why not chosen
```

## Next Steps

- [ADR 001: useFetch vs useAsyncData →](/architecture/decisions/001-useFetch-vs-useAsyncData)
- [Architecture Overview →](/architecture/)
