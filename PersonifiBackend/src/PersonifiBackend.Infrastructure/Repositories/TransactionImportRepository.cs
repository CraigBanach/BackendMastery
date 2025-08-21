using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Infrastructure.Repositories;

public class TransactionImportRepository : ITransactionImportRepository
{
    private readonly PersonifiDbContext _context;

    public TransactionImportRepository(PersonifiDbContext context)
    {
        _context = context;
    }

    public async Task<TransactionImport?> GetByIdAsync(int id, int accountId)
    {
        return await _context.TransactionImports
            .Include(ti => ti.PendingTransactions)
            .FirstOrDefaultAsync(ti => ti.Id == id && ti.AccountId == accountId);
    }

    public async Task<List<TransactionImport>> GetByAccountIdAsync(int accountId)
    {
        return await _context.TransactionImports
            .Where(ti => ti.AccountId == accountId)
            .OrderByDescending(ti => ti.CreatedAt)
            .ToListAsync();
    }

    public async Task<TransactionImport> CreateAsync(TransactionImport transactionImport)
    {
        transactionImport.CreatedAt = DateTime.UtcNow;
        _context.TransactionImports.Add(transactionImport);
        await _context.SaveChangesAsync();
        return transactionImport;
    }

    public async Task UpdateAsync(TransactionImport transactionImport)
    {
        _context.TransactionImports.Update(transactionImport);
        await _context.SaveChangesAsync();
    }
}