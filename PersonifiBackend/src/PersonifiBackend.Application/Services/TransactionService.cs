using AutoMapper;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Application.Helpers;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<TransactionService> _logger;

    public TransactionService(
        ITransactionRepository repository,
        IMapper mapper,
        ILogger<TransactionService> logger
    )
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TransactionDto?> GetByIdAsync(int id, int accountId)
    {
        var transaction = await _repository.GetByIdAsync(id, accountId);
        return transaction == null ? null : _mapper.Map<TransactionDto>(transaction);
    }

    public async Task<PagedResponse<TransactionDto>> GetAccountTransactionsAsync(
        int accountId,
        PaginationRequest pagination,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? categoryId = null
    )
    {
        var result = await _repository.GetAccountTransactionsAsync(
            accountId,
            pagination,
            startDate,
            endDate,
            categoryId
        );

        return PaginationHelper.CreatePagedResponse<Transaction, TransactionDto>(
            result,
            pagination,
            _mapper
        );
    }

    public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto, int accountId, int createdByUserId)
    {
        var transaction = _mapper.Map<Transaction>(dto);
        transaction.AccountId = accountId;
        transaction.CreatedByUserId = createdByUserId;

        var created = await _repository.CreateAsync(transaction);
        _logger.LogInformation(
            "Created transaction {TransactionId} for account {AccountId}",
            created.Id,
            accountId
        );

        return _mapper.Map<TransactionDto>(created);
    }

    public async Task<TransactionDto?> UpdateAsync(int id, UpdateTransactionDto dto, int accountId)
    {
        var existing = await _repository.GetByIdAsync(id, accountId);
        if (existing == null)
            return null;

        _mapper.Map(dto, existing);
        var updated = await _repository.UpdateAsync(existing);

        _logger.LogInformation("Updated transaction {TransactionId} for account {AccountId}", id, accountId);

        return _mapper.Map<TransactionDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id, int accountId)
    {
        var result = await _repository.DeleteAsync(id, accountId);

        if (result)
        {
            _logger.LogInformation(
                "Deleted transaction {TransactionId} for account {AccountId}",
                id,
                accountId
            );
        }

        return result;
    }
}
