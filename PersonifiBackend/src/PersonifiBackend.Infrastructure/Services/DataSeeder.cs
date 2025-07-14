using System.Diagnostics;
using Bogus;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Infrastructure.Services;

public interface IDataSeederService
{
    Task SeedDataAsync(
        int userCount = 10,
        int transactionsPerUser = 1000,
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
        CancellationToken cancellationToken = default
    )
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();

        _logger.LogInformation(
            "Starting data seeding: {UserCount} users with {TransactionsPerUser} transactions each",
            userCount,
            transactionsPerUser
        );
        var stopwatch = Stopwatch.StartNew();

        // Generate user IDs
        var userIds = Enumerable.Range(1, userCount).Select(i => $"test-user-{i:D4}").ToList();

        // Seed categories for each user
        var categoriesByUser = new Dictionary<string, List<Category>>();
        foreach (var userId in userIds)
        {
            var categories = await SeedCategoriesForUser(dbContext, userId, cancellationToken);
            categoriesByUser[userId] = categories;
        }

        // Seed transactions in batches for better performance
        const int batchSize = 1000;
        var totalTransactions = 0;

        foreach (var userId in userIds)
        {
            var categories = categoriesByUser[userId];
            var transactions = GenerateTransactions(userId, categories, transactionsPerUser);

            // Insert in batches
            foreach (var batch in transactions.Chunk(batchSize))
            {
                await dbContext.Transactions.AddRangeAsync(batch, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
                totalTransactions += batch.Length;

                if (totalTransactions % 10000 == 0)
                {
                    _logger.LogInformation("Seeded {Count} transactions...", totalTransactions);
                }
            }
        }

        // Seed budgets
        foreach (var userId in userIds)
        {
            await SeedBudgetsForUser(
                dbContext,
                userId,
                categoriesByUser[userId],
                cancellationToken
            );
        }

        stopwatch.Stop();
        _logger.LogInformation(
            "Data seeding completed in {ElapsedSeconds}s. Total transactions: {TotalTransactions}",
            stopwatch.Elapsed.TotalSeconds,
            totalTransactions
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

    public async Task<int> GetExistingTestUserCountAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();
        
        return await dbContext.Transactions
            .Where(t => t.UserId.StartsWith("test-user-"))
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

        await dbContext.Categories.AddRangeAsync(categories, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

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

        await dbContext.Budgets.AddRangeAsync(budgets, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}

// Optional: Hosted service for seeding on startup (development only)
public class DataSeederHostedService : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DataSeederHostedService> _logger;
    private readonly IHostEnvironment _environment;

    public DataSeederHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<DataSeederHostedService> logger,
        IHostEnvironment environment
    )
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _environment = environment;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!_environment.IsDevelopment())
            return;

        // Check if we should seed (e.g., via environment variable)
        var shouldSeed = Environment.GetEnvironmentVariable("SEED_DATABASE") == "true";
        if (shouldSeed)
        {
            using var scope = _scopeFactory.CreateScope();
            var dataSeederService = scope.ServiceProvider.GetRequiredService<IDataSeederService>();

            _logger.LogInformation("Seeding database on startup...");
            await dataSeederService.SeedDataAsync(10, 1000, cancellationToken);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
