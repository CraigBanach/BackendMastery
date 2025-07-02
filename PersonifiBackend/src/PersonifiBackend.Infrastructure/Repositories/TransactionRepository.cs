using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;

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

    public async Task<IEnumerable<Transaction>> GetUserTransactionsAsync(
        string userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? categoryId = null
    )
    {
        var query = _context.Transactions.Include(t => t.Category).Where(t => t.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(t => t.TransactionDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(t => t.TransactionDate <= endDate.Value);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        return await query
            .OrderByDescending(t => t.TransactionDate)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        transaction.CreatedAt = DateTime.UtcNow;
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(transaction.Id, transaction.UserId)
            ?? throw new InvalidOperationException("Failed to retrieve created transaction");
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction)
    {
        transaction.UpdatedAt = DateTime.UtcNow;
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
}
