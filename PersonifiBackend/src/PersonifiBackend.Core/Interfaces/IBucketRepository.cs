using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface IBucketRepository
{
    Task<Bucket?> GetByIdAsync(int id, int accountId);
    Task<IEnumerable<Bucket>> GetAllByAccountIdAsync(int accountId);
    Task AddAsync(Bucket bucket);
    void Update(Bucket bucket);
    void Delete(Bucket bucket);
    Task SaveChangesAsync();
}
