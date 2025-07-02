namespace PersonifiBackend.Core.DTOs;

public record CreateTransactionDto(
    decimal Amount,
    string Description,
    string? Notes,
    DateTime TransactionDate,
    int CategoryId
);

public record UpdateTransactionDto(
    decimal Amount,
    string Description,
    string? Notes,
    DateTime TransactionDate,
    int CategoryId
);

public record TransactionDto(
    int Id,
    decimal Amount,
    string Description,
    string? Notes,
    DateTime TransactionDate,
    CategoryDto Category,
    DateTime CreatedAt
);

