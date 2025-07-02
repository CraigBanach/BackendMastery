# ADR-001: Use Clean Architecture Pattern

**Date:** 2025-06-07
**Status:** Accepted
**Deciders:** Craig Banach
**Technical Story:** Initial project setup

## Context

Need a maintainable, testable architecture for the Personifi backend that supports:

- Clear separation of concerns
- Independent of frameworks
- Testable business logic
- Easy to modify and extend

## Decision

Implement Clean Architecture with four layers:

- **Core**: Domain entities, interfaces, DTOs (no dependencies)
- **Application**: Business logic, services, validators (depends on Core)
- **Infrastructure**: Data access, external services (depends on Core)
- **API**: Controllers, middleware, configuration (depends on all)

## Consequences

**Positive:**

- Business logic is isolated from infrastructure concerns
- Easy to unit test core business logic
- Can swap out infrastructure components (e.g., database, auth provider)
- Clear dependency flow (inward only)

**Negative:**

- More initial setup complexity
- May be overkill for simple CRUD operations
- Requires mapping between layers (DTOs)

## Alternatives Considered

1. **Traditional layered architecture**: Simpler but tighter coupling
2. **Vertical slice architecture**: Better for larger teams, overkill for solo project
3. **Minimal API with services**: Too simple for learning enterprise patterns
