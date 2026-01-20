using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Infrastructure.Repositories;

public class BucketRepository : IBucketRepository
{
    private readonly PersonifiDbContext _context;

    public BucketRepository(PersonifiDbContext context)
    {
        _context = context;
    }

    public async Task<Bucket?> GetByIdAsync(int id, int accountId)
    {
        return await _context.Buckets
            .FirstOrDefaultAsync(b => b.Id == id && b.AccountId == accountId);
    }

    public async Task<IEnumerable<Bucket>> GetAllByAccountIdAsync(int accountId)
    {
        return await _context.Buckets
            .Where(b => b.AccountId == accountId)
            .OrderBy(b => b.Name)
            .ToListAsync();
    }

    public async Task AddAsync(Bucket bucket)
    {
        await _context.Buckets.AddAsync(bucket);
    }

    public void Update(Bucket bucket)
    {
        _context.Buckets.Update(bucket);
    }

    public void Delete(Bucket bucket)
    {
        _context.Buckets.Remove(bucket);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
