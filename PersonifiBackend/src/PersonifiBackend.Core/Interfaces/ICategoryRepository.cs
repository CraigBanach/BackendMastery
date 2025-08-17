using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(int id, int accountId);
    Task<IEnumerable<Category>> GetAccountCategoriesAsync(int accountId);
    Task<Category> CreateAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task<bool> DeleteAsync(int id, int accountId);
}
