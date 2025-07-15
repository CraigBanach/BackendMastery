using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface IPerformanceTestingService
{
    Task<PerformanceReport> RunPerformanceTestsAsync(
        string userId,
        CancellationToken cancellationToken = default
    );
}
