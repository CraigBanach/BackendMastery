using AutoMapper;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(
        ICategoryRepository repository,
        IMapper mapper,
        ILogger<CategoryService> logger
    )
    {
        _repository = repository;
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
        return await _repository.DeleteAsync(id, accountId);
    }
}
