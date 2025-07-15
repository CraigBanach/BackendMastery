using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Core.Interfaces;

public interface ITransactionService
{
    Task<TransactionDto?> GetByIdAsync(int id, string userId);
    Task<PagedResponse<TransactionDto>> GetUserTransactionsAsync(
        string userId,
        PaginationRequest pagination,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? categoryId = null
    );
    Task<TransactionDto> CreateAsync(CreateTransactionDto dto, string userId);
    Task<TransactionDto?> UpdateAsync(int id, UpdateTransactionDto dto, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}