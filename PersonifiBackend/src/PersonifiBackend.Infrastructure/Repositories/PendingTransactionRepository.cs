using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Infrastructure.Repositories;

public class PendingTransactionRepository : IPendingTransactionRepository
{
    private readonly PersonifiDbContext _context;

    public PendingTransactionRepository(PersonifiDbContext context)
    {
        _context = context;
    }

    public async Task<PendingTransaction?> GetByIdAsync(int id, int accountId)
    {
        return await _context.PendingTransactions
            .Include(pt => pt.Category)
            .FirstOrDefaultAsync(pt => pt.Id == id && pt.AccountId == accountId);
    }

    public async Task<List<PendingTransaction>> GetByAccountIdAsync(int accountId, int page = 1, int pageSize = 20)
    {
        return await _context.PendingTransactions
            .Include(pt => pt.Category)
            .Where(pt => pt.AccountId == accountId)
            .OrderBy(pt => pt.TransactionDate)
            .ThenBy(pt => pt.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetCountByAccountIdAsync(int accountId)
    {
        return await _context.PendingTransactions
            .CountAsync(pt => pt.AccountId == accountId);
    }

    public async Task<List<PendingTransaction>> GetByStatusAsync(int accountId, PendingTransactionStatus status)
    {
        return await _context.PendingTransactions
            .Include(pt => pt.Category)
            .Where(pt => pt.AccountId == accountId && pt.Status == status)
            .OrderByDescending(pt => pt.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<PendingTransaction>> GetByImportIdAsync(int transactionImportId)
    {
        return await _context.PendingTransactions
            .Where(pt => pt.TransactionImportId == transactionImportId)
            .ToListAsync();
    }

    public async Task<PendingTransaction> CreateAsync(PendingTransaction pendingTransaction)
    {
        pendingTransaction.CreatedAt = DateTime.UtcNow;
        _context.PendingTransactions.Add(pendingTransaction);
        await _context.SaveChangesAsync();
        return pendingTransaction;
    }

    public async Task<List<PendingTransaction>> CreateRangeAsync(List<PendingTransaction> pendingTransactions)
    {
        var now = DateTime.UtcNow;
        foreach (var transaction in pendingTransactions)
        {
            transaction.CreatedAt = now;
        }
        
        _context.PendingTransactions.AddRange(pendingTransactions);
        await _context.SaveChangesAsync();
        return pendingTransactions;
    }

    public async Task UpdateAsync(PendingTransaction pendingTransaction)
    {
        pendingTransaction.UpdatedAt = DateTime.UtcNow;
        _context.PendingTransactions.Update(pendingTransaction);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var pendingTransaction = await _context.PendingTransactions.FindAsync(id);
        if (pendingTransaction != null)
        {
            _context.PendingTransactions.Remove(pendingTransaction);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<PendingTransaction>> FindPotentialDuplicatesAsync(int accountId, decimal amount, DateTime transactionDate, string description)
    {
        var startDate = transactionDate.AddDays(-1);
        var endDate = transactionDate.AddDays(1);

        return await _context.PendingTransactions
            .Where(pt => pt.AccountId == accountId 
                && pt.Amount == amount 
                && pt.TransactionDate >= startDate 
                && pt.TransactionDate <= endDate
                && EF.Functions.Like(pt.Description.ToLower(), $"%{description.ToLower()}%"))
            .ToListAsync();
    }

    public async Task<bool> HasPendingTransactionsForCategoryAsync(int categoryId, int accountId)
    {
        return await _context.PendingTransactions
            .Where(pt => pt.CategoryId == categoryId && pt.AccountId == accountId)
            .AnyAsync();
    }
}