using AutoMapper;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Services;

public class BucketService : IBucketService
{
    private readonly IBucketRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<BucketService> _logger;

    public BucketService(
        IBucketRepository repository,
        IMapper mapper,
        ILogger<BucketService> logger
    )
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<BucketDto?> GetByIdAsync(int id, int accountId)
    {
        var bucket = await _repository.GetByIdAsync(id, accountId);
        return bucket == null ? null : _mapper.Map<BucketDto>(bucket);
    }

    public async Task<IEnumerable<BucketDto>> GetAccountBucketsAsync(int accountId)
    {
        var buckets = await _repository.GetAllByAccountIdAsync(accountId);
        return _mapper.Map<IEnumerable<BucketDto>>(buckets);
    }

    public async Task<BucketDto> CreateAsync(CreateBucketDto dto, int accountId)
    {
        var bucket = _mapper.Map<Bucket>(dto);
        bucket.AccountId = accountId;
        bucket.CurrentBalance = dto.CurrentBalance ?? 0m;

        await _repository.AddAsync(bucket);
        await _repository.SaveChangesAsync();

        _logger.LogInformation(
            "Created bucket {BucketId} for account {AccountId}",
            bucket.Id,
            accountId
        );

        return _mapper.Map<BucketDto>(bucket);
    }

    public async Task<BucketDto?> UpdateAsync(int id, UpdateBucketDto dto, int accountId)
    {
        var existing = await _repository.GetByIdAsync(id, accountId);
        if (existing == null)
            return null;

        _mapper.Map(dto, existing);

        if (dto.CurrentBalance.HasValue)
        {
            existing.CurrentBalance = dto.CurrentBalance.Value;
        }
        
        _repository.Update(existing);
        await _repository.SaveChangesAsync();

        return _mapper.Map<BucketDto>(existing);
    }

    public async Task<bool> DeleteAsync(int id, int accountId)
    {
        var bucket = await _repository.GetByIdAsync(id, accountId);
        if (bucket == null)
        {
            return false;
        }

        _repository.Delete(bucket);
        await _repository.SaveChangesAsync();
        return true;
    }
}
