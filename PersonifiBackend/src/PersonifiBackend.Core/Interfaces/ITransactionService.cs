using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Core.Interfaces;

public interface ITransactionService
{
    Task<TransactionDto?> GetByIdAsync(int id, int accountId);
    Task<PagedResponse<TransactionDto>> GetAccountTransactionsAsync(
        int accountId,
        PaginationRequest pagination,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? categoryId = null
    );
    Task<TransactionDto> CreateAsync(CreateTransactionDto dto, int accountId, int createdByUserId);
    Task<TransactionDto?> UpdateAsync(int id, UpdateTransactionDto dto, int accountId);
    Task<bool> DeleteAsync(int id, int accountId);
}