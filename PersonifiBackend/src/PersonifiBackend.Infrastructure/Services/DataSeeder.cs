using System.Diagnostics;
using Bogus;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Npgsql;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Infrastructure.Data;
using Polly;
using Polly.Retry;

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
    private readonly ResiliencePipeline _retryPipeline;

    public DataSeederService(IServiceScopeFactory scopeFactory, ILogger<DataSeederService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        
        // Configure retry policy for transient database failures using Polly v8
        _retryPipeline = new ResiliencePipelineBuilder()
            .AddRetry(new RetryStrategyOptions
            {
                ShouldHandle = new PredicateBuilder()
                    .Handle<NpgsqlException>()
                    .Handle<TimeoutException>()
                    .Handle<InvalidOperationException>(ex => ex.Message.Contains("transient failure")),
                MaxRetryAttempts = 3,
                Delay = TimeSpan.FromSeconds(1),
                BackoffType = DelayBackoffType.Exponential, // 1s, 2s, 4s
                OnRetry = args =>
                {
                    _logger.LogWarning("Database operation failed, retrying attempt {AttemptNumber}/3. Delay: {Delay}ms. Error: {Exception}",
                        args.AttemptNumber + 1, 
                        args.RetryDelay.TotalMilliseconds,
                        args.Outcome.Exception?.Message);
                    return ValueTask.CompletedTask;
                }
            })
            .Build();
    }

    /// <summary>
    /// Simple parallel implementation: Process each user independently
    /// Categories → Transactions & Budgets run in parallel per user
    /// </summary>
    public async Task SeedDataAsync(
        int userCount = 10,
        int transactionsPerUser = 1000,
        IProgress<(int current, int total)>? categoryProgress = null,
        IProgress<(int current, int total, double percentage)>? transactionProgress = null,
        IProgress<(int current, int total)>? budgetProgress = null,
        CancellationToken cancellationToken = default
    )
    {
        _logger.LogInformation(
            "Starting parallel data seeding: {UserCount} users with {TransactionsPerUser} transactions each",
            userCount,
            transactionsPerUser
        );
        var stopwatch = Stopwatch.StartNew();

        // Generate user IDs
        var userIds = Enumerable.Range(1, userCount).Select(i => $"test-user-{i:D4}").ToList();

        // Thread-safe counters for progress reporting
        var categoriesCompleted = 0;
        var transactionsCompleted = 0;
        var budgetsCompleted = 0;
        var expectedTotalTransactions = userCount * transactionsPerUser;

        // Semaphore to limit concurrent database operations
        // Conservative limit for Supabase free tier (15 connection pool / 2 per user)
        var semaphore = new SemaphoreSlim(Math.Min(Environment.ProcessorCount, 7));

        // Process each user independently in parallel
        var userTasks = userIds.Select(async userId =>
        {
            await semaphore.WaitAsync(cancellationToken);
            try
            {
                // Step 1: Create categories for this user
                using var scope = _scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();
                
                var categories = await _retryPipeline.ExecuteAsync(async cancellationToken =>
                {
                    return await SeedCategoriesForUser(dbContext, userId, cancellationToken);
                }, cancellationToken);
                
                // Report category progress
                var currentCategories = Interlocked.Increment(ref categoriesCompleted);
                categoryProgress?.Report((currentCategories, userCount));

                // Step 2: Run transactions and budgets in parallel for this user
                var transactionTask = SeedTransactionsForUser(userId, categories, transactionsPerUser, 
                    (batchSize) => {
                        var current = Interlocked.Add(ref transactionsCompleted, batchSize);
                        var percentage = (double)current / expectedTotalTransactions * 100;
                        transactionProgress?.Report((current, expectedTotalTransactions, percentage));
                    }, cancellationToken);

                var budgetTask = SeedBudgetsForUser(userId, categories, 
                    () => {
                        var current = Interlocked.Increment(ref budgetsCompleted);
                        budgetProgress?.Report((current, userCount));
                    }, cancellationToken);

                // Wait for both to complete
                await Task.WhenAll(transactionTask, budgetTask);
            }
            finally
            {
                semaphore.Release();
            }
        });

        // Wait for all users to complete
        await Task.WhenAll(userTasks);

        stopwatch.Stop();
        _logger.LogInformation(
            "Parallel data seeding completed in {ElapsedSeconds}s. Total transactions: {TotalTransactions}",
            stopwatch.Elapsed.TotalSeconds,
            expectedTotalTransactions
        );
    }

    public async Task ClearDataAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();

        _logger.LogWarning("Clearing all test data...");

        // Delete test data only (preserve real user data)
        await dbContext.Database.ExecuteSqlRawAsync(
            "DELETE FROM \"Transactions\" WHERE \"UserId\" LIKE 'test-user-%'",
            cancellationToken
        );

        await dbContext.Database.ExecuteSqlRawAsync(
            "DELETE FROM \"Budgets\" WHERE \"UserId\" LIKE 'test-user-%'",
            cancellationToken
        );

        await dbContext.Database.ExecuteSqlRawAsync(
            "DELETE FROM \"Categories\" WHERE \"UserId\" LIKE 'test-user-%'",
            cancellationToken
        );

        _logger.LogInformation("Test data cleared");
    }

    public async Task<int> GetExistingTestUserCountAsync(
        CancellationToken cancellationToken = default
    )
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();

        return await dbContext
            .Transactions.Where(t => t.UserId.StartsWith("test-user-"))
            .Select(t => t.UserId)
            .Distinct()
            .CountAsync(cancellationToken);
    }

    private async Task<List<Category>> SeedCategoriesForUser(
        PersonifiDbContext dbContext,
        string userId,
        CancellationToken cancellationToken
    )
    {
        var existingCategories = await dbContext
            .Categories.Where(c => c.UserId == userId)
            .ToListAsync(cancellationToken);

        if (existingCategories.Count != 0)
            return existingCategories;

        var categories = new List<Category>
        {
            new()
            {
                Name = "Groceries",
                Type = CategoryType.Expense,
                Icon = "🛒",
                Color = "#22c55e",
                UserId = userId,
            },
            new()
            {
                Name = "Rent",
                Type = CategoryType.Expense,
                Icon = "🏠",
                Color = "#3b82f6",
                UserId = userId,
            },
            new()
            {
                Name = "Transport",
                Type = CategoryType.Expense,
                Icon = "🚗",
                Color = "#f59e0b",
                UserId = userId,
            },
            new()
            {
                Name = "Entertainment",
                Type = CategoryType.Expense,
                Icon = "🎮",
                Color = "#8b5cf6",
                UserId = userId,
            },
            new()
            {
                Name = "Utilities",
                Type = CategoryType.Expense,
                Icon = "💡",
                Color = "#06b6d4",
                UserId = userId,
            },
            new()
            {
                Name = "Healthcare",
                Type = CategoryType.Expense,
                Icon = "🏥",
                Color = "#ec4899",
                UserId = userId,
            },
            new()
            {
                Name = "Shopping",
                Type = CategoryType.Expense,
                Icon = "🛍️",
                Color = "#f43f5e",
                UserId = userId,
            },
            new()
            {
                Name = "Dining Out",
                Type = CategoryType.Expense,
                Icon = "🍴",
                Color = "#f97316",
                UserId = userId,
            },
            new()
            {
                Name = "Salary",
                Type = CategoryType.Income,
                Icon = "💰",
                Color = "#10b981",
                UserId = userId,
            },
            new()
            {
                Name = "Freelance",
                Type = CategoryType.Income,
                Icon = "💼",
                Color = "#6366f1",
                UserId = userId,
            },
            new()
            {
                Name = "Investments",
                Type = CategoryType.Income,
                Icon = "📈",
                Color = "#84cc16",
                UserId = userId,
            },
        };

        await _retryPipeline.ExecuteAsync(async cancellationToken =>
        {
            await dbContext.Categories.AddRangeAsync(categories, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return categories;
    }

    private List<Transaction> GenerateTransactions(
        string userId,
        List<Category> categories,
        int count
    )
    {
        var faker = new Faker<Transaction>()
            .RuleFor(t => t.UserId, userId)
            .RuleFor(
                t => t.TransactionDate,
                f => f.Date.Between(DateTime.Now.AddYears(-2), DateTime.Now)
            )
            .RuleFor(t => t.CreatedAt, (f, t) => t.TransactionDate.AddHours(f.Random.Int(1, 24)))
            .RuleFor(t => t.CategoryId, f => f.PickRandom(categories).Id)
            .RuleFor(
                t => t.Amount,
                (f, t) =>
                {
                    var category = categories.First(c => c.Id == t.CategoryId);
                    return category.Type == CategoryType.Income
                        ? f.Random.Decimal(1000, 5000)
                        : category.Name switch
                        {
                            "Rent" => f.Random.Decimal(800, 2000),
                            "Groceries" => f.Random.Decimal(50, 300),
                            "Transport" => f.Random.Decimal(10, 150),
                            "Entertainment" => f.Random.Decimal(10, 200),
                            "Utilities" => f.Random.Decimal(50, 200),
                            "Healthcare" => f.Random.Decimal(20, 500),
                            "Shopping" => f.Random.Decimal(20, 400),
                            "Dining Out" => f.Random.Decimal(15, 100),
                            _ => f.Random.Decimal(10, 200),
                        };
                }
            )
            .RuleFor(
                t => t.Description,
                (f, t) =>
                {
                    var category = categories.First(c => c.Id == t.CategoryId);
                    return category.Name switch
                    {
                        "Groceries" => f.PickRandom(
                            "Tesco",
                            "Sainsbury's",
                            "ASDA",
                            "Waitrose",
                            "Lidl",
                            "Aldi"
                        ),
                        "Rent" => "Monthly Rent Payment",
                        "Transport" => f.PickRandom(
                            "Uber",
                            "TfL",
                            "Train ticket",
                            "Petrol",
                            "Bus fare"
                        ),
                        "Entertainment" => f.PickRandom(
                            "Netflix",
                            "Cinema",
                            "Concert",
                            "Steam",
                            "Spotify"
                        ),
                        "Utilities" => f.PickRandom(
                            "Electric bill",
                            "Gas bill",
                            "Water bill",
                            "Internet",
                            "Mobile"
                        ),
                        "Healthcare" => f.PickRandom("GP visit", "Pharmacy", "Dentist", "Optician"),
                        "Shopping" => f.PickRandom(
                            "Amazon",
                            "John Lewis",
                            "Primark",
                            "Next",
                            "M&S"
                        ),
                        "Dining Out" => f.PickRandom(
                            "Pizza Express",
                            "Nando's",
                            "Local pub",
                            "Coffee shop"
                        ),
                        "Salary" => "Monthly Salary",
                        "Freelance" => f.PickRandom(
                            "Web design project",
                            "Consulting",
                            "Photography",
                            "Writing"
                        ),
                        "Investments" => f.PickRandom("Dividend payment", "Stock sale", "Interest"),
                        _ => f.Commerce.ProductName(),
                    };
                }
            )
            .RuleFor(t => t.Notes, f => f.Random.Bool(0.3f) ? f.Lorem.Sentence() : null);

        return faker.Generate(count);
    }

    private async Task SeedBudgetsForUser(
        PersonifiDbContext dbContext,
        string userId,
        List<Category> categories,
        CancellationToken cancellationToken
    )
    {
        var expenseCategories = categories.Where(c => c.Type == CategoryType.Expense).ToList();
        var budgets = new List<Budget>();

        foreach (var category in expenseCategories)
        {
            var monthlyAmount = category.Name switch
            {
                "Rent" => 1200m,
                "Groceries" => 400m,
                "Transport" => 150m,
                "Entertainment" => 100m,
                "Utilities" => 150m,
                "Healthcare" => 50m,
                "Shopping" => 200m,
                "Dining Out" => 150m,
                _ => 100m,
            };

            budgets.Add(
                new Budget
                {
                    UserId = userId,
                    CategoryId = category.Id,
                    Amount = monthlyAmount,
                    Period = BudgetPeriod.Monthly,
                    StartDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1),
                    IsActive = true,
                }
            );
        }

        await _retryPipeline.ExecuteAsync(async cancellationToken =>
        {
            await dbContext.Budgets.AddRangeAsync(budgets, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }, cancellationToken);
    }

    /// <summary>
    /// Helper method to seed transactions for a single user
    /// </summary>
    private async Task SeedTransactionsForUser(
        string userId,
        List<Category> categories,
        int transactionsPerUser,
        Action<int> onBatchComplete,
        CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();
        
        var transactions = GenerateTransactions(userId, categories, transactionsPerUser);
        
        // Insert in batches for better performance
        const int batchSize = 1000;
        foreach (var batch in transactions.Chunk(batchSize))
        {
            await _retryPipeline.ExecuteAsync(async cancellationToken =>
            {
                await dbContext.Transactions.AddRangeAsync(batch, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
            }, cancellationToken);
            
            // Report progress AFTER successful completion (outside retry block)
            onBatchComplete(batch.Length);
        }
    }

    /// <summary>
    /// Helper method to seed budgets for a single user
    /// </summary>
    private async Task SeedBudgetsForUser(
        string userId,
        List<Category> categories,
        Action onComplete,
        CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();
        
        await _retryPipeline.ExecuteAsync(async cancellationToken =>
        {
            await SeedBudgetsForUser(dbContext, userId, categories, cancellationToken);
        }, cancellationToken);
        
        // Report progress AFTER successful completion (outside retry block)
        onComplete();
    }

}
