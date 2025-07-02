using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(int id, string userId);
    Task<IEnumerable<Transaction>> GetUserTransactionsAsync(
        string userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? categoryId = null
    );
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<Transaction> UpdateAsync(Transaction transaction);
    Task<bool> DeleteAsync(int id, string userId);
}
