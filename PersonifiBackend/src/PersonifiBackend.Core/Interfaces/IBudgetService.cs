using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Core.Interfaces;

public interface IBudgetService
{
    Task<IEnumerable<BudgetVarianceDto>> GetBudgetVarianceAsync(string userId, int year, int month);
    Task<IEnumerable<BudgetDto>> GetBudgetsForMonthAsync(string userId, int year, int month);
    Task<IEnumerable<BudgetDto>> SetBudgetsForMonthAsync(string userId, int year, int month, IEnumerable<SetBudgetDto> budgets);
    Task<BudgetDto?> GetBudgetAsync(string userId, int categoryId, int year, int month);
}