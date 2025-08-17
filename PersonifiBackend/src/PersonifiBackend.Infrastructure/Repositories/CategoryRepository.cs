using Microsoft.EntityFrameworkCore;
using Npgsql;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Exceptions;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;
using PersonifiBackend.Infrastructure.Exceptions;

namespace PersonifiBackend.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly PersonifiDbContext _context;

    public CategoryRepository(PersonifiDbContext context)
    {
        _context = context;
    }

    public async Task<Category?> GetByIdAsync(int id, int accountId)
    {
        return await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && c.AccountId == accountId);
    }

    public async Task<IEnumerable<Category>> GetAccountCategoriesAsync(int accountId)
    {
        var query = _context.Categories.Where(c => c.AccountId == accountId);

        return await query.ToListAsync();
    }

    public async Task<Category> CreateAsync(Category category)
    {
        try
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(category.Id, category.AccountId)
                ?? throw new InvalidOperationException("Failed to retrieve created category");
        }
        catch (DbUpdateException ex)
        {
            throw DatabaseExceptionHandler.HandleDbException(ex, "Category", category.Name);
        }
        catch (Exception ex)
        {
            // Handle other exceptions
            throw new InvalidOperationException(
                "An error occurred while creating the category",
                ex
            );
        }
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        var existingCategory = await GetByIdAsync(category.Id, category.AccountId);
        if (existingCategory == null)
            throw new KeyNotFoundException("Category not found");
        existingCategory.Name = category.Name;
        _context.Categories.Update(existingCategory);
        await _context.SaveChangesAsync();
        return existingCategory;
    }

    public async Task<bool> DeleteAsync(int id, int accountId)
    {
        var category = await GetByIdAsync(id, accountId);
        if (category == null)
            return false;
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }
}
