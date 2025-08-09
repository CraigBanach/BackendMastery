using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Infrastructure.Services;

public class PerformanceTestingService : IPerformanceTestingService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PerformanceTestingService> _logger;

    public PerformanceTestingService(
        IServiceProvider serviceProvider,
        ILogger<PerformanceTestingService> logger
    )
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<PerformanceReport> RunPerformanceTestsAsync(
        string userId,
        CancellationToken cancellationToken = default
    )
    {
        var report = new PerformanceReport
        {
            TestRunId = Guid.NewGuid(),
            StartTime = DateTime.Now,
            UserId = userId,
        };

        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();
        var transactionRepo = scope.ServiceProvider.GetRequiredService<ITransactionRepository>();

        // Test 1: Count total transactions
        report.Tests.Add(
            await TestQueryPerformance(
                "Count All Transactions",
                async () =>
                    await context
                        .Transactions.Where(t => t.UserId == userId)
                        .CountAsync(cancellationToken)
            )
        );

        // Test 2: Get recent transactions (no pagination)
        report.Tests.Add(
            await TestQueryPerformance(
                "Get Recent 100 Transactions",
                async () =>
                    await context
                        .Transactions.Where(t => t.UserId == userId)
                        .OrderByDescending(t => t.TransactionDate)
                        .Take(100)
                        .ToListAsync(cancellationToken)
            )
        );

        // Test 3: Get transactions with includes
        report.Tests.Add(
            await TestQueryPerformance(
                "Get Transactions with Category (Include)",
                async () =>
                    await context
                        .Transactions.Include(t => t.Category)
                        .Where(t => t.UserId == userId)
                        .OrderByDescending(t => t.TransactionDate)
                        .Take(100)
                        .ToListAsync(cancellationToken)
            )
        );

        // Test 4: Date range query
        var endDate = DateTime.Now;
        var startDate = endDate.AddMonths(-1);
        report.Tests.Add(
            await TestQueryPerformance(
                "Get Last Month's Transactions",
                async () =>
                    await context
                        .Transactions.Where(t =>
                            t.UserId == userId
                            && t.TransactionDate >= startDate
                            && t.TransactionDate <= endDate
                        )
                        .ToListAsync(cancellationToken)
            )
        );

        // Test 5: Aggregation query
        report.Tests.Add(
            await TestQueryPerformance(
                "Sum by Category (Last 3 Months)",
                async () =>
                    await context
                        .Transactions.Where(t =>
                            t.UserId == userId && t.TransactionDate >= DateTime.Now.AddMonths(-3)
                        )
                        .GroupBy(t => t.CategoryId)
                        .Select(g => new
                        {
                            CategoryId = g.Key,
                            Total = g.Sum(t => t.Amount),
                            Count = g.Count(),
                        })
                        .ToListAsync(cancellationToken)
            )
        );

        // Test 6: Complex filtering
        report.Tests.Add(
            await TestQueryPerformance(
                "Complex Filter (Amount > 100, Multiple Categories)",
                async () =>
                {
                    var categoryIds = await context
                        .Categories.Where(c =>
                            c.UserId == userId && c.Type == Core.Entities.CategoryType.Expense
                        )
                        .Take(3)
                        .Select(c => c.Id)
                        .ToListAsync(cancellationToken);

                    return await context
                        .Transactions.Where(t =>
                            t.UserId == userId
                            && t.Amount > 100
                            && categoryIds.Contains(t.CategoryId)
                        )
                        .OrderByDescending(t => t.TransactionDate)
                        .Take(50)
                        .ToListAsync(cancellationToken);
                }
            )
        );

        // Test 7: Pagination simulation
        report.Tests.Add(
            await TestQueryPerformance(
                "Paginated Query (Page 10, Size 50)",
                async () =>
                    await context
                        .Transactions.Where(t => t.UserId == userId)
                        .OrderByDescending(t => t.TransactionDate)
                        .Skip(450) // Page 10 with size 50
                        .Take(50)
                        .ToListAsync(cancellationToken)
            )
        );

        var paginationRequest = new PaginationRequest
        {
            Page = 10,
            PageSize = 50,
            SortDescending = true,
        };

        // Test 8: Repository method performance
        report.Tests.Add(
            await TestQueryPerformance(
                "Repository GetUserTransactions",
                async () =>
                    await transactionRepo.GetUserTransactionsAsync(
                        userId,
                        paginationRequest,
                        startDate,
                        endDate
                    )
            )
        );

        report.EndTime = DateTime.Now;
        report.TotalDuration = report.EndTime - report.StartTime;

        // Log summary
        _logger.LogInformation(
            "Performance test completed. Total duration: {Duration}ms",
            report.TotalDuration.TotalMilliseconds
        );
        foreach (var test in report.Tests.OrderByDescending(t => t.Duration))
        {
            _logger.LogInformation(
                "Test '{Name}': {Duration}ms, {MemoryDelta}KB",
                test.Name,
                test.Duration.TotalMilliseconds,
                test.MemoryDelta / 1024
            );
        }

        return report;
    }

    private async Task<PerformanceTestResult> TestQueryPerformance(
        string testName,
        Func<Task<object>> testAction
    )
    {
        var result = new PerformanceTestResult { Name = testName };

        // Warm up
        await testAction();

        // Force garbage collection for accurate memory measurement
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();

        var startMemory = GC.GetTotalMemory(false);
        var stopwatch = Stopwatch.StartNew();

        try
        {
            result.Result = await testAction();
            result.Success = true;
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Error = ex.Message;
            _logger.LogError(ex, "Performance test '{TestName}' failed", testName);
        }

        stopwatch.Stop();
        var endMemory = GC.GetTotalMemory(false);

        result.Duration = stopwatch.Elapsed;
        result.MemoryDelta = endMemory - startMemory;

        return result;
    }
}
