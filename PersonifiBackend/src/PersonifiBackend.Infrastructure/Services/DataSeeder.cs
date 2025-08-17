using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace PersonifiBackend.Infrastructure.Services;

public interface IDataSeederService
{
    Task SeedDataAsync(
        int userCount = 10,
        int transactionsPerUser = 1000,
        IProgress<(int current, int total)>? categoryProgress = null,
        IProgress<(int current, int total, double percentage)>? transactionProgress = null,
        IProgress<(int current, int total)>? budgetProgress = null,
        CancellationToken cancellationToken = default
    );
    
    Task ClearDataAsync(CancellationToken cancellationToken = default);
    Task<int> GetExistingTestUserCountAsync(CancellationToken cancellationToken = default);
}

public class DataSeederService : IDataSeederService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DataSeederService> _logger;

    public DataSeederService(IServiceScopeFactory scopeFactory, ILogger<DataSeederService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task SeedDataAsync(
        int userCount = 10,
        int transactionsPerUser = 1000,
        IProgress<(int current, int total)>? categoryProgress = null,
        IProgress<(int current, int total, double percentage)>? transactionProgress = null,
        IProgress<(int current, int total)>? budgetProgress = null,
        CancellationToken cancellationToken = default
    )
    {
        _logger.LogWarning("DataSeeder temporarily disabled - needs to be updated for account-based architecture");
        await Task.CompletedTask;
    }

    public async Task ClearDataAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("ClearDataAsync temporarily disabled - needs to be updated for account-based architecture");
        await Task.CompletedTask;
    }

    public async Task<int> GetExistingTestUserCountAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("GetExistingTestUserCountAsync temporarily disabled - needs to be updated for account-based architecture");
        await Task.CompletedTask;
        return 0;
    }
}