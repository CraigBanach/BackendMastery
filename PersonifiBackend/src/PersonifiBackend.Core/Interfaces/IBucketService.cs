using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Core.Interfaces;

public interface IBucketService
{
    Task<BucketDto?> GetByIdAsync(int id, int accountId);
    Task<IEnumerable<BucketDto>> GetAccountBucketsAsync(int accountId);
    Task<BucketDto> CreateAsync(CreateBucketDto bucketDto, int accountId);
    Task<BucketDto?> UpdateAsync(int id, UpdateBucketDto bucketDto, int accountId);
    Task<bool> DeleteAsync(int id, int accountId);
}
