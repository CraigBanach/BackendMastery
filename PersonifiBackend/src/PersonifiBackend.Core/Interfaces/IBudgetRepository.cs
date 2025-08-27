using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface IBudgetRepository
{
    Task<Budget?> GetByIdAsync(int id, int accountId);
    Task<Budget?> GetBudgetAsync(int accountId, int categoryId, int year, int month);
    Task<IEnumerable<Budget>> GetBudgetsForMonthAsync(int accountId, int year, int month);
    Task<Budget> CreateAsync(Budget budget);
    Task<Budget?> UpdateAsync(Budget budget);
    Task<bool> DeleteAsync(int id, int accountId);
    Task<IEnumerable<Budget>> SetBudgetsForMonthAsync(int accountId, int year, int month, IEnumerable<SetBudgetRequest> budgets);
    Task DeleteBudgetsByCategoryAsync(int categoryId, int accountId);
}

public record SetBudgetRequest(int CategoryId, decimal Amount);