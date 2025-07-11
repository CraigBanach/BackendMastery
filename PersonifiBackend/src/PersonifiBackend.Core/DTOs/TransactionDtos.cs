namespace PersonifiBackend.Core.DTOs;

// TODO: Create FluentValidation validator for CreateTransactionDto
public record CreateTransactionDto(
    decimal Amount,
    string Description,
    string? Notes,
    DateTime TransactionDate,
    int CategoryId
);

// TODO: Create FluentValidation validator for UpdateTransactionDto
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

