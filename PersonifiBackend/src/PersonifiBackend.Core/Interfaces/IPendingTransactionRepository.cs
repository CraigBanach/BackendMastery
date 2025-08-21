using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface IPendingTransactionRepository
{
    Task<PendingTransaction?> GetByIdAsync(int id, int accountId);
    Task<List<PendingTransaction>> GetByAccountIdAsync(int accountId, int page = 1, int pageSize = 20);
    Task<int> GetCountByAccountIdAsync(int accountId);
    Task<List<PendingTransaction>> GetByStatusAsync(int accountId, PendingTransactionStatus status);
    Task<PendingTransaction> CreateAsync(PendingTransaction pendingTransaction);
    Task<List<PendingTransaction>> CreateRangeAsync(List<PendingTransaction> pendingTransactions);
    Task UpdateAsync(PendingTransaction pendingTransaction);
    Task DeleteAsync(int id);
    Task<List<PendingTransaction>> FindPotentialDuplicatesAsync(int accountId, decimal amount, DateTime transactionDate, string description);
}