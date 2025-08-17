using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Core.Interfaces;

public interface ICategoryService
{
    Task<CategoryDto?> GetByIdAsync(int id, int accountId);
    Task<IEnumerable<CategoryDto>> GetAccountCategoriesAsync(int accountId);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto, int accountId);
    Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto, int accountId);
    Task<bool> DeleteAsync(int id, int accountId);
}