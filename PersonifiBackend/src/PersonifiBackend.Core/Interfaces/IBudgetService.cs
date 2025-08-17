using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Core.Interfaces;

public interface IBudgetService
{
    Task<IEnumerable<BudgetVarianceDto>> GetBudgetVarianceAsync(int accountId, int year, int month);
    Task<IEnumerable<BudgetDto>> GetBudgetsForMonthAsync(int accountId, int year, int month);
    Task<IEnumerable<BudgetDto>> SetBudgetsForMonthAsync(int accountId, int year, int month, IEnumerable<SetBudgetDto> budgets);
    Task<BudgetDto?> GetBudgetAsync(int accountId, int categoryId, int year, int month);
}