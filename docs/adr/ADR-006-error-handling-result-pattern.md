# ADR-006: Result Pattern for Error Handling

**Date:** 2025-01-10
**Status:** Accepted
**Deciders:** Craig Banach
**Technical Story:** Improving error handling consistency and controller clarity

## Context

Currently using exceptions for both expected and unexpected failures in the application flow. This led to:

- Controllers losing visibility of possible error responses
- Difficulty documenting API behaviour in OpenAPI/Swagger
- Mixing business logic failures with truly exceptional circumstances
- "Action at a distance" anti-pattern where errors are handled far from where they're thrown

Need a solution that:
- Makes error cases explicit in method signatures
- Keeps controllers aware of possible outcomes
- Maintains clean, testable code
- Distinguishes between expected and unexpected failures

## Decision

Implement the Result Pattern for handling expected failures:

1. **Use Result<T> for operations that can fail** in predictable ways (validation, not found, conflicts)
2. **Keep exceptions for truly exceptional cases** (database connection failures, out of memory)
3. **Controllers explicitly map Results to HTTP responses**
4. **Global exception handler only catches unexpected exceptions**

Example implementation:
```csharp
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public ResultType Type { get; }
}

// Service returns Result instead of throwing
public async Task<Result<CategoryDto>> CreateAsync(CreateCategoryDto dto, string userId)
{
    if (duplicateExists)
        return Result<CategoryDto>.Conflict("Category already exists");
    
    // ... create category
    return Result<CategoryDto>.Success(createdDto);
}

// Controller explicitly handles each case
return result.Type switch
{
    ResultType.Ok => Created(...),
    ResultType.Conflict => Conflict(...),
    ResultType.Invalid => BadRequest(...),
    _ => StatusCode(500)
};
```

## Consequences

**Positive:**
- **Explicit error handling**: Method signatures show all possible outcomes
- **Better documentation**: OpenAPI can accurately reflect all response types
- **Improved testability**: Can test error paths without exception handling
- **Clear separation**: Expected vs unexpected failures are distinct
- **Type safety**: Compiler ensures all result types are handled
- **No hidden behaviour**: Controllers control their own responses

**Negative:**
- **More verbose**: Controllers have more code (switch expressions)
- **Refactoring effort**: Existing code needs updating
- **Can't use [ApiController] automatic 400 responses**: Must handle validation manually

**Neutral:**
- Different from standard .NET practices (which often use exceptions)
- Similar to functional programming approaches (F#, Rust, Go)

## Alternatives Considered

1. **Full Global Exception Handling**
   - Pros: Very clean controllers, DRY
   - Cons: Hidden behaviour, poor OpenAPI docs, "action at a distance"
   - Rejected: Loses too much explicitness

2. **OneOf<T1, T2> Library**
   - Pros: Even more type-safe, discriminated unions
   - Cons: Additional dependency, steeper learning curve
   - Rejected: Result<T> is simpler and sufficient

3. **Try-Catch in Every Action**
   - Pros: Very explicit, standard C# approach
   - Cons: Repetitive, noisy controllers
   - Rejected: Too much boilerplate

4. **Domain Events for Errors**
   - Pros: Decoupled error handling
   - Cons: Over-engineered for this project size
   - Rejected: Unnecessary complexity

## References

- [Vladimir Khorikov - Functional C#: Handling Failures](https://enterprisecraftsmanship.com/posts/functional-c-handling-failures-input-errors/)
- [Milan Jovanović - Result Pattern](https://www.milanjovanovic.tech/blog/functional-error-handling-in-dotnet-with-the-result-pattern)
- [Scott Wlaschin - Railway Oriented Programming](https://fsharpforfunandprofit.com/posts/recipe-part2/)
- [Nick Chapsas - Stop Using Exceptions for Flow Control](https://www.youtube.com/watch?v=a1ye9eGTB98)