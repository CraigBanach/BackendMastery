using PersonifiBackend.Core.Entities;

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

public record CategoryDto(
    int Id,
    string Name,
    CategoryType Type,
    string? Icon,
    string? Color
);