using AutoMapper;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IPendingTransactionRepository _pendingTransactionRepository;
    private readonly IBudgetRepository _budgetRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(
        ICategoryRepository repository,
        ITransactionRepository transactionRepository,
        IPendingTransactionRepository pendingTransactionRepository,
        IBudgetRepository budgetRepository,
        IMapper mapper,
        ILogger<CategoryService> logger
    )
    {
        _repository = repository;
        _transactionRepository = transactionRepository;
        _pendingTransactionRepository = pendingTransactionRepository;
        _budgetRepository = budgetRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<CategoryDto?> GetByIdAsync(int id, int accountId)
    {
        var category = await _repository.GetByIdAsync(id, accountId);
        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }

    public async Task<IEnumerable<CategoryDto>> GetAccountCategoriesAsync(int accountId)
    {
        var categories = await _repository.GetAccountCategoriesAsync(accountId);
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, int accountId)
    {
        var category = _mapper.Map<Category>(dto);
        category.AccountId = accountId;

        var created = await _repository.CreateAsync(category);
        _logger.LogInformation(
            "Created category {CategoryId} for account {AccountId}",
            created.Id,
            accountId
        );

        return _mapper.Map<CategoryDto>(created);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto, int accountId)
    {
        var existing = await _repository.GetByIdAsync(id, accountId);
        if (existing == null)
            return null;
        var updatedCategory = _mapper.Map(dto, existing);
        updatedCategory.AccountId = accountId;
        var updated = await _repository.UpdateAsync(updatedCategory);
        return _mapper.Map<CategoryDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id, int accountId)
    {
        // Get the category first to provide better error messages
        var category = await _repository.GetByIdAsync(id, accountId);
        if (category == null)
        {
            return false;
        }

        // Check if category has any transactions
        var hasTransactions = await _transactionRepository.HasTransactionsForCategoryAsync(id, accountId);
        if (hasTransactions)
        {
            throw new InvalidOperationException($"Cannot delete the '{category.Name}' category because it has existing transactions. Please reassign these transactions to another category first, then try deleting again.");
        }

        // Check if category has any pending transactions
        var hasPendingTransactions = await _pendingTransactionRepository.HasPendingTransactionsForCategoryAsync(id, accountId);
        if (hasPendingTransactions)
        {
            throw new InvalidOperationException($"Cannot delete the '{category.Name}' category because it has pending transactions from imports. Please approve or reject these transactions first, then try deleting again.");
        }

        // Delete associated budgets first
        await _budgetRepository.DeleteBudgetsByCategoryAsync(id, accountId);

        // Now delete the category
        return await _repository.DeleteAsync(id, accountId);
    }
}
