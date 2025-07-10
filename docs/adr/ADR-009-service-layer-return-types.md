# ADR-009: Service Layer Return Types

**Date:** 2025-01-10
**Status:** Accepted
**Deciders:** Craig Banach
**Technical Story:** Defining service layer boundaries and return type patterns

## Context

Need to establish clear patterns for service layer method returns with requirements:

- Prevent domain entities leaking to presentation layer
- Support explicit error handling via Result pattern
- Enable service-to-service communication
- Maintain clean architecture boundaries
- Keep flexibility for future batch operations

## Decision

Service layer methods will:

1. **Return `Result<TDto>` for public API operations** - prevents entity leakage
2. **Return domain entities for internal service-to-service calls** - enables rich domain operations
3. **Use separate interfaces** for public vs internal operations when needed
4. **Defer batch operation patterns** until actual requirements emerge

Example implementation:

```csharp
// Public service interface (used by controllers)
public interface ITransactionService
{
    Task<Result<TransactionDto>> GetByIdAsync(int id, string userId);
    Task<Result<TransactionDto>> CreateAsync(CreateTransactionDto dto, string userId);
    Task<Result<bool>> DeleteAsync(int id, string userId);
}
```

## Consequences

**Positive:**

- **Clean boundaries**: DTOs for external, entities for internal
- **Explicit errors**: Result pattern makes failure modes clear
- **Testable**: Can mock Results easily
- **Flexible**: Services can communicate richly internally
- **Evolvable**: Can add batch patterns later without breaking changes

**Negative:**

- **Dual interfaces**: Some services need both public and internal interfaces
- **More mapping**: Must map entities to DTOs
- **Verbose returns**: `Result<T>` more complex than just `T`
- **Potential duplication**: Similar methods for internal/external use

**Neutral:**

- Controllers never see domain entities
- Services must handle their own mapping
- Different patterns for different use cases

## Implementation Guidelines

1. **Controller-facing methods** always return `Result<TDto>`
2. **Service-to-service methods** can return domain entities
3. **Never return IQueryable** - always materialise results
4. **Empty collections** instead of null for multiple results
5. **Batch operations** to be designed when requirements are clear

## Example Patterns

```csharp
// Query that might return nothing
public async Task<Result<TransactionDto>> GetByIdAsync(int id, string userId)
{
    var entity = await _repository.GetByIdAsync(id, userId);
    if (entity == null)
        return Result<TransactionDto>.NotFound();

    return Result<TransactionDto>.Success(_mapper.Map<TransactionDto>(entity));
}

// Query that returns collection
public async Task<Result<IEnumerable<TransactionDto>>> GetAllAsync(string userId)
{
    var entities = await _repository.GetUserTransactionsAsync(userId);
    var dtos = _mapper.Map<IEnumerable<TransactionDto>>(entities);
    return Result<IEnumerable<TransactionDto>>.Success(dtos);
}
```

## Alternatives Considered

1. **Always return DTOs**

   - Pros: Simple, consistent
   - Cons: Limits service-to-service communication
   - Rejected: Too restrictive for complex operations

2. **Always return entities**

   - Pros: Rich domain model available
   - Cons: Breaks clean architecture
   - Rejected: Leaks domain to presentation

3. **Return commands/events**

   - Pros: Event-driven, decoupled
   - Cons: Over-complex for current needs
   - Rejected: YAGNI - can evolve to this if needed

4. **Generic service response wrapper**
   - Pros: Consistent envelope for all responses
   - Cons: Additional complexity, mapping overhead
   - Rejected: Result<T> is sufficient

## Future Considerations

- Batch operations pattern TBD based on actual requirements
- May introduce CQRS if query complexity grows
- Could add caching decorators without changing interfaces

## References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) by Robert C. Martin
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html) by Martin Fowler
- [Result Pattern Implementation](https://enterprisecraftsmanship.com/posts/functional-c-handling-failures-input-errors/) by Vladimir Khorikov
