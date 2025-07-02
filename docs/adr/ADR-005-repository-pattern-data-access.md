# ADR-005: Repository Pattern for Data Access

**Date:** 2025-06-07
**Status:** Accepted
**Deciders:** Craig Banach
**Technical Story:** Data access abstraction

## Context

Need to:

- Abstract data access from business logic
- Make testing easier
- Support potential future database changes

## Decision

Implement Repository pattern:

- One repository per aggregate root
- Interfaces in Core layer
- Implementations in Infrastructure layer
- Return domain entities, not DbSet

## Consequences

**Positive:**

- Business logic doesn't depend on EF Core
- Easy to mock for testing
- Can optimize queries per use case
- Clear separation of concerns

**Negative:**

- Additional abstraction layer
- Can lead to leaky abstractions
- Potential for inefficient queries if not careful

## Alternatives Considered

1. **Direct DbContext usage**: Simpler but couples business logic to EF
2. **CQRS pattern**: Better for complex domains but overkill here
3. **Generic repository**: More reusable but often becomes bloated
