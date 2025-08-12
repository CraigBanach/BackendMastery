using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Infrastructure.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly PersonifiDbContext _context;

    public BudgetRepository(PersonifiDbContext context)
    {
        _context = context;
    }

    public async Task<Budget?> GetByIdAsync(int id, string userId)
    {
        return await _context.Budgets
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
    }

    public async Task<Budget?> GetBudgetAsync(string userId, int categoryId, int year, int month)
    {
        return await _context.Budgets
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => 
                b.UserId == userId && 
                b.CategoryId == categoryId && 
                b.Year == year && 
                b.Month == month);
    }

    public async Task<IEnumerable<Budget>> GetBudgetsForMonthAsync(string userId, int year, int month)
    {
        return await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId && b.Year == year && b.Month == month)
            .ToListAsync();
    }

    public async Task<Budget> CreateAsync(Budget budget)
    {
        budget.CreatedAt = DateTime.UtcNow;
        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();
        return budget;
    }

    public async Task<Budget?> UpdateAsync(Budget budget)
    {
        var existing = await GetByIdAsync(budget.Id, budget.UserId);
        if (existing == null) return null;

        existing.Amount = budget.Amount;
        existing.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var budget = await GetByIdAsync(id, userId);
        if (budget == null) return false;

        _context.Budgets.Remove(budget);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Budget>> SetBudgetsForMonthAsync(string userId, int year, int month, IEnumerable<SetBudgetRequest> budgets)
    {
        var existingBudgets = await GetBudgetsForMonthAsync(userId, year, month);
        var existingDict = existingBudgets.ToDictionary(b => b.CategoryId);
        
        var updatedBudgets = new List<Budget>();

        foreach (var budgetRequest in budgets)
        {
            if (existingDict.TryGetValue(budgetRequest.CategoryId, out var existing))
            {
                existing.Amount = budgetRequest.Amount;
                existing.UpdatedAt = DateTime.UtcNow;
                updatedBudgets.Add(existing);
            }
            else
            {
                var newBudget = new Budget
                {
                    UserId = userId,
                    CategoryId = budgetRequest.CategoryId,
                    Amount = budgetRequest.Amount,
                    Year = year,
                    Month = month,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Budgets.Add(newBudget);
                updatedBudgets.Add(newBudget);
            }
        }

        await _context.SaveChangesAsync();
        
        // Return with loaded categories
        return await GetBudgetsForMonthAsync(userId, year, month);
    }
}