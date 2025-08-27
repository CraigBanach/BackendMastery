using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(int id, int accountId);
    Task<PaginationResult<Transaction>> GetAccountTransactionsAsync(
        int accountId,
        PaginationRequest pagination,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? categoryId = null
    );
    Task<IEnumerable<Transaction>> GetTransactionsByDateRangeAsync(
        int accountId,
        DateTime startDate,
        DateTime endDate,
        int? categoryId = null
    );
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<Transaction> UpdateAsync(Transaction transaction);
    Task<bool> DeleteAsync(int id, int accountId);
    Task<List<Transaction>> FindPotentialDuplicatesAsync(int accountId, decimal amount, DateTime transactionDate, string description);
    Task<List<Transaction>> FindExactDuplicatesAsync(int accountId, decimal amount, DateTime transactionDate, string counterParty);
    Task<bool> HasTransactionsForCategoryAsync(int categoryId, int accountId);
}
