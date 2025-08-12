using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.DTOs;

public record BudgetVarianceDto(
    CategoryDto Category,
    decimal Budgeted,
    decimal Actual,
    string MonthlyPaceStatus,
    decimal ExpectedSpendToDate
);

public record SetBudgetDto(
    int CategoryId,
    decimal Amount
);

public record BudgetDto(
    int Id,
    CategoryDto Category,
    decimal Amount,
    int Year,
    int Month
);