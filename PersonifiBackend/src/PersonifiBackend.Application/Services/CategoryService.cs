using AutoMapper;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Services;

public interface ICategoryService
{
    Task<CategoryDto?> GetByIdAsync(int id, string userId);
    Task<IEnumerable<CategoryDto>> GetUserCategoriesAsync(string userId);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto, string userId);
    Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}

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

    public async Task<CategoryDto?> GetByIdAsync(int id, string userId)
    {
        var category = await _repository.GetByIdAsync(id, userId);
        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }

    public async Task<IEnumerable<CategoryDto>> GetUserCategoriesAsync(string userId)
    {
        var categories = await _repository.GetUserCategoriesAsync(userId);
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, string userId)
    {
        var category = _mapper.Map<Category>(dto);
        category.UserId = userId;

        var created = await _repository.CreateAsync(category);
        _logger.LogInformation(
            "Created category {CategoryId} for authenticated user",
            created.Id
        );

        return _mapper.Map<CategoryDto>(created);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto, string userId)
    {
        var existing = await _repository.GetByIdAsync(id, userId);
        if (existing == null)
            return null;
        var updatedCategory = _mapper.Map(dto, existing);
        updatedCategory.UserId = userId;
        var updated = await _repository.UpdateAsync(updatedCategory);
        return _mapper.Map<CategoryDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        return await _repository.DeleteAsync(id, userId);
    }
}
