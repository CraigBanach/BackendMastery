using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly PersonifiDbContext _context;

    public CategoryRepository(PersonifiDbContext context)
    {
        _context = context;
    }

    public async Task<Category?> GetByIdAsync(int id, string userId)
    {
        return await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
    }

    public async Task<IEnumerable<Category>> GetUserCategoriesAsync(string userId)
    {
        var query = _context.Categories.Where(c => c.UserId == userId);

        return await query.ToListAsync();
    }

    public async Task<Category> CreateAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(category.Id, category.UserId)
            ?? throw new InvalidOperationException("Failed to retrieve created category");
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        var existingCategory = await GetByIdAsync(category.Id, category.UserId);
        if (existingCategory == null)
            throw new KeyNotFoundException("Category not found");
        existingCategory.Name = category.Name;
        _context.Categories.Update(existingCategory);
        await _context.SaveChangesAsync();
        return existingCategory;
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var category = await GetByIdAsync(id, userId);
        if (category == null)
            return false;
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }
}
