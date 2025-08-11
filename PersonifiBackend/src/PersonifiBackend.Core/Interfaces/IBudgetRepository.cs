using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface IBudgetRepository
{
    Task<Budget?> GetByIdAsync(int id, string userId);
    Task<Budget?> GetBudgetAsync(string userId, int categoryId, int year, int month);
    Task<IEnumerable<Budget>> GetBudgetsForMonthAsync(string userId, int year, int month);
    Task<Budget> CreateAsync(Budget budget);
    Task<Budget?> UpdateAsync(Budget budget);
    Task<bool> DeleteAsync(int id, string userId);
    Task<IEnumerable<Budget>> SetBudgetsForMonthAsync(string userId, int year, int month, IEnumerable<SetBudgetRequest> budgets);
}

public record SetBudgetRequest(int CategoryId, decimal Amount);