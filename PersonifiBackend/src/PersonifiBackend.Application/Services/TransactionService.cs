using AutoMapper;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Application.Helpers;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Services;

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

    public async Task<TransactionDto?> GetByIdAsync(int id, string userId)
    {
        var transaction = await _repository.GetByIdAsync(id, userId);
        return transaction == null ? null : _mapper.Map<TransactionDto>(transaction);
    }

    public async Task<PagedResponse<TransactionDto>> GetUserTransactionsAsync(
        string userId,
        PaginationRequest pagination,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? categoryId = null
    )
    {
        var result = await _repository.GetUserTransactionsAsync(
            userId,
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

    public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto, string userId)
    {
        var transaction = _mapper.Map<Transaction>(dto);
        transaction.UserId = userId;

        var created = await _repository.CreateAsync(transaction);
        _logger.LogInformation(
            "Created transaction {TransactionId} for user {UserId}",
            created.Id,
            userId
        );

        return _mapper.Map<TransactionDto>(created);
    }

    public async Task<TransactionDto?> UpdateAsync(int id, UpdateTransactionDto dto, string userId)
    {
        var existing = await _repository.GetByIdAsync(id, userId);
        if (existing == null)
            return null;

        _mapper.Map(dto, existing);
        var updated = await _repository.UpdateAsync(existing);

        _logger.LogInformation("Updated transaction {TransactionId} for user {UserId}", id, userId);

        return _mapper.Map<TransactionDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var result = await _repository.DeleteAsync(id, userId);

        if (result)
        {
            _logger.LogInformation(
                "Deleted transaction {TransactionId} for user {UserId}",
                id,
                userId
            );
        }

        return result;
    }
}
