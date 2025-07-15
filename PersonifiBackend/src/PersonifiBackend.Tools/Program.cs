using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.Configuration;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;
using PersonifiBackend.Infrastructure.Repositories;
using PersonifiBackend.Infrastructure.Services;
using PersonifiBackend.Tools;
using Serilog;

var builder = Host.CreateApplicationBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration) // Ensure the Serilog.Settings.Configuration package is installed
    .CreateLogger();

// Remove default logging providers
builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

// Explicitly add user secrets in development
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// Minimal DB configuration for DataSeederService
builder.Services.AddDbContext<PersonifiDbContext>(options =>
{
    var dbConnectionString =
        builder
            .Configuration.GetSection(DatabaseOptions.SectionName)
            .Get<DatabaseOptions>()
            ?.ConnectionString
        ?? throw new InvalidOperationException("Database connection string is not configured.");

    options.UseNpgsql(dbConnectionString);
});

builder.Services.AddScoped<IDataSeederService, DataSeederService>();
builder.Services.AddScoped<IPerformanceTestingService, PerformanceTestingService>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();

var host = builder.Build();

// Simple menu-driven console application
var serviceProvider = host.Services;
var logger = serviceProvider.GetRequiredService<ILogger<Program>>();

try
{
    logger.LogInformation("PersonifiBackend Tools started");

    while (true)
    {
        Console.WriteLine("\n=== PersonifiBackend Tools ===");
        Console.WriteLine("[S]eed Database");
        Console.WriteLine("[C]lear Test Data");
        Console.WriteLine("[P]erformance Test");
        Console.WriteLine("[E]xit");
        Console.Write("Select an option: ");

        var choice = Console.ReadLine()?.ToUpper();

        switch (choice)
        {
            case "S":
                await SeedDatabase(serviceProvider);
                break;
            case "C":
                await ClearTestData(serviceProvider);
                break;
            case "P":
                await RunPerformanceTests(serviceProvider);
                break;
            case "E":
                logger.LogInformation("Exiting PersonifiBackend Tools");
                return;
            default:
                Console.WriteLine("Invalid option. Please try again.");
                break;
        }
    }
}
catch (Exception ex)
{
    logger.LogError(ex, "An error occurred in PersonifiBackend Tools");
}
finally
{
    Log.CloseAndFlush();
}

static async Task SeedDatabase(IServiceProvider serviceProvider)
{
    using var scope = serviceProvider.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<IDataSeederService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    // Check for existing test data first
    var existingTestUsers = await seeder.GetExistingTestUserCountAsync();
    if (existingTestUsers > 0)
    {
        logger.LogWarning("Found {ExistingCount} existing test users", existingTestUsers);
        Console.Write("Clear existing test data first? (y/N): ");
        var clearConfirmation = Console.ReadLine();
        if (clearConfirmation?.ToLower() == "y")
        {
            await seeder.ClearDataAsync();
            logger.LogInformation("Existing test data cleared");
        }
        else
        {
            Console.Write("Continue seeding anyway? (y/N): ");
            var continueConfirmation = Console.ReadLine();
            if (continueConfirmation?.ToLower() != "y")
            {
                logger.LogInformation("Seeding cancelled by user");
                return;
            }
        }
    }

    Console.Write("Enter number of users (default 10): ");
    var usersInput = Console.ReadLine();
    var userCount = int.TryParse(usersInput, out var users) ? users : 10;

    Console.Write("Enter transactions per user (default 1000): ");
    var transactionsInput = Console.ReadLine();
    var transactionCount = int.TryParse(transactionsInput, out var transactions)
        ? transactions
        : 1000;

    logger.LogInformation("Starting database seeding...");

    // Configuration
    const int progressUpdateIntervalMs = 1000;

    // Create progress tracker (separated concern)
    var progressTracker = new SeedingProgressTracker(userCount, transactionCount);
    var progressDisplay = new ConsoleProgressDisplay();

    // Simple progress reporters that just update the tracker
    var categoryProgress = new Progress<(int current, int total)>(progress =>
        progressTracker.UpdateCategories(progress.current)
    );

    var transactionProgress = new Progress<(int current, int total, double percentage)>(progress =>
        progressTracker.UpdateTransactions(progress.current)
    );

    var budgetProgress = new Progress<(int current, int total)>(progress =>
        progressTracker.UpdateBudgets(progress.current)
    );

    // Timer-based progress reporting
    var progressTimer = new System.Timers.Timer(progressUpdateIntervalMs);
    progressTimer.Elapsed += (sender, e) =>
    {
        if (progressTracker.IsCompleted)
            return;

        var status = progressTracker.GetCurrentStatus();
        progressDisplay.ShowProgress(status);
    };

    progressTimer.Start();

    await seeder.SeedDataAsync(
        userCount,
        transactionCount,
        categoryProgress,
        transactionProgress,
        budgetProgress
    );

    progressTracker.MarkCompleted();
    progressTimer.Stop();
    progressTimer.Dispose();

    // Final completion message
    progressDisplay.ShowCompletion();
    logger.LogInformation("Database seeding completed");
}

static async Task ClearTestData(IServiceProvider serviceProvider)
{
    using var scope = serviceProvider.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<IDataSeederService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    Console.Write("Are you sure you want to clear all test data? (y/N): ");
    var confirmation = Console.ReadLine();

    if (confirmation?.ToLower() == "y")
    {
        logger.LogInformation("Clearing test data...");
        await seeder.ClearDataAsync();
        logger.LogInformation("Test data cleared");
    }
    else
    {
        Console.WriteLine("Operation cancelled");
    }
}

static async Task RunPerformanceTests(IServiceProvider serviceProvider)
{
    using var scope = serviceProvider.CreateScope();
    var performanceService = scope.ServiceProvider.GetRequiredService<IPerformanceTestingService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    Console.Write("Enter user ID for performance tests: ");
    var userId = Console.ReadLine()?.Trim();

    if (string.IsNullOrEmpty(userId))
    {
        logger.LogError("User ID cannot be empty");
        return;
    }
    try
    {
        logger.LogInformation("Running performance tests for user {UserId}", userId);

        var report = await performanceService.RunPerformanceTestsAsync(userId);

        logger.LogInformation(
            "Performance tests completed. Report ID: {ReportId}",
            report.TestRunId
        );
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while running performance tests");
    }
}
