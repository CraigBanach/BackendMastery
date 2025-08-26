using PersonifiBackend.Core.DTOs;
using Microsoft.AspNetCore.Http;

namespace PersonifiBackend.Core.Interfaces;

public interface ITransactionImportService
{
    Task<TransactionImportDto> ImportTransactionsFromCsvAsync(IFormFile file, int accountId, int userId);
    Task<PaginationResult<PendingTransactionDto>> GetPendingTransactionsAsync(int accountId, int page = 1, int pageSize = 20);
    Task<PendingTransactionDto?> GetPendingTransactionByIdAsync(int id, int accountId);
    Task<bool> ApprovePendingTransactionAsync(int id, int accountId, ApprovePendingTransactionRequest request);
    Task<bool> ApprovePendingTransactionSplitAsync(int id, int accountId, ApprovePendingTransactionSplitRequest request);
    Task<bool> RejectPendingTransactionAsync(int id, int accountId);
    Task<int> BulkApproveTransactionsAsync(int accountId, BulkApproveTransactionsRequest request);
    Task<int> BulkRejectTransactionsAsync(int accountId, BulkRejectTransactionsRequest request);
    Task<List<TransactionImportDto>> GetImportHistoryAsync(int accountId);
}