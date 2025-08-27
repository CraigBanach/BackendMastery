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

    public async Task<Transaction?> GetByIdAsync(int id, int accountId)
    {
        return await _context
            .Transactions.Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.AccountId == accountId);
    }

    public async Task<PaginationResult<Transaction>> GetAccountTransactionsAsync(
        int accountId,
        PaginationRequest pagination,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? categoryId = null
    )
    {
        var query = _context.Transactions.Include(t => t.Category).Where(t => t.AccountId == accountId);

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
        transaction.CreatedAt = DateTime.UtcNow;
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(transaction.Id, transaction.AccountId)
            ?? throw new InvalidOperationException("Failed to retrieve created transaction");
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction)
    {
        transaction.UpdatedAt = DateTime.UtcNow;
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(transaction.Id, transaction.AccountId)
            ?? throw new InvalidOperationException("Failed to retrieve updated transaction");
    }

    public async Task<bool> DeleteAsync(int id, int accountId)
    {
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t =>
            t.Id == id && t.AccountId == accountId
        );

        if (transaction == null)
            return false;

        _context.Transactions.Remove(transaction);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsByDateRangeAsync(
        int accountId,
        DateTime startDate,
        DateTime endDate,
        int? categoryId = null)
    {
        var query = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.AccountId == accountId && 
                       t.TransactionDate >= startDate && 
                       t.TransactionDate <= endDate);

        if (categoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == categoryId.Value);
        }

        return await query.ToListAsync();
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

    public async Task<List<Transaction>> FindPotentialDuplicatesAsync(int accountId, decimal amount, DateTime transactionDate, string description)
    {
        var startDate = transactionDate.AddDays(-1);
        var endDate = transactionDate.AddDays(1);

        return await _context.Transactions
            .Where(t => t.AccountId == accountId 
                && t.Amount == amount 
                && t.TransactionDate >= startDate 
                && t.TransactionDate <= endDate
                && EF.Functions.Like(t.Description.ToLower(), $"%{description.ToLower()}%"))
            .ToListAsync();
    }

    public async Task<List<Transaction>> FindExactDuplicatesAsync(int accountId, decimal amount, DateTime transactionDate, string counterParty)
    {
        return await _context.Transactions
            .Where(t => t.AccountId == accountId 
                && t.Amount == amount 
                && t.TransactionDate.Date == transactionDate.Date
                && EF.Functions.Like(t.Description.ToLower(), counterParty.ToLower()))
            .ToListAsync();
    }

    public async Task<bool> HasTransactionsForCategoryAsync(int categoryId, int accountId)
    {
        return await _context.Transactions
            .Where(t => t.CategoryId == categoryId && t.AccountId == accountId)
            .AnyAsync();
    }
}
