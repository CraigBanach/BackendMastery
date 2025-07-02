using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(int id, string userId);
    Task<IEnumerable<Category>> GetUserCategoriesAsync(string userId);
    Task<Category> CreateAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task<bool> DeleteAsync(int id, string userId);
}
