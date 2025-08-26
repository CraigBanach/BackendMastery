using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface ITransactionImportRepository
{
    Task<TransactionImport?> GetByIdAsync(int id, int accountId);
    Task<TransactionImport?> GetByIdAsync(int id);
    Task<List<TransactionImport>> GetByAccountIdAsync(int accountId);
    Task<TransactionImport> CreateAsync(TransactionImport transactionImport);
    Task UpdateAsync(TransactionImport transactionImport);
}