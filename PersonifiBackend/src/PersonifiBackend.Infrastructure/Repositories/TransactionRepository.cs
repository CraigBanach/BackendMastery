using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;
using PersonifiBackend.Infrastructure.Extensions;

namespace PersonifiBackend.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly PersonifiDbContext _context;

    public TransactionRepository(PersonifiDbContext context)
    {
        _context = context;
    }

    public async Task<Transaction?> GetByIdAsync(int id, string userId)
    {
        return await _context
            .Transactions.Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    }

    public async Task<PaginationResult<Transaction>> GetUserTransactionsAsync(
        string userId,
        PaginationRequest pagination,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? categoryId = null
    )
    {
        var query = _context.Transactions.Include(t => t.Category).Where(t => t.UserId == userId);

        // Apply filters
        if (startDate.HasValue)
            query = query.Where(t => t.TransactionDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(t => t.TransactionDate <= endDate.Value);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        // Apply sorting
        query = ApplySorting(query, pagination.SortBy, pagination.SortDescending);

        // Use extension method to paginate
        return await query.ToPaginationResultAsync(pagination);
    }

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        transaction.CreatedAt = DateTime.Now;
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(transaction.Id, transaction.UserId)
            ?? throw new InvalidOperationException("Failed to retrieve created transaction");
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction)
    {
        transaction.UpdatedAt = DateTime.Now;
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(transaction.Id, transaction.UserId)
            ?? throw new InvalidOperationException("Failed to retrieve updated transaction");
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t =>
            t.Id == id && t.UserId == userId
        );

        if (transaction == null)
            return false;

        _context.Transactions.Remove(transaction);
        return await _context.SaveChangesAsync() > 0;
    }

    private static IQueryable<Transaction> ApplySorting(
        IQueryable<Transaction> query,
        string? sortBy,
        bool descending
    )
    {
        // Dynamic sorting based on property name
        return sortBy?.ToLower() switch
        {
            "amount" => descending
                ? query.OrderByDescending(t => t.Amount).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.Amount).ThenBy(t => t.Id),
            "description" => descending
                ? query.OrderByDescending(t => t.Description).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.Description).ThenBy(t => t.Id),
            "category" => descending
                ? query.OrderByDescending(t => t.Category.Name).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.Category.Name).ThenBy(t => t.Id),
            "date" or "transactiondate" => descending
                ? query.OrderByDescending(t => t.TransactionDate).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.TransactionDate).ThenBy(t => t.Id),
            _ => descending
                ? query.OrderByDescending(t => t.TransactionDate).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.TransactionDate).ThenBy(t => t.Id),
        };
    }
}
