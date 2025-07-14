using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Api.Tests.Fixtures;

public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup>
    where TStartup : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove all existing DbContextOptions
            var dbContextOptions = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<PersonifiDbContext>))
                .ToList();

            foreach (var descriptor in dbContextOptions)
            {
                services.Remove(descriptor);
            }

            // Remove the DbContext itself if registered (optional, usually safe)
            var contextDescriptor = services.SingleOrDefault(d =>
                d.ImplementationType == typeof(PersonifiDbContext)
            );
            if (contextDescriptor is not null)
            {
                services.Remove(contextDescriptor);
            }

            // Add in-memory database for testing
            services.AddDbContext<PersonifiDbContext>(options =>
            {
                options.UseInMemoryDatabase("InMemoryDbForTesting");
            });

            // Override authentication for testing
            services
                .AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });

            // Build service provider
            var sp = services.BuildServiceProvider();

            // Create scope for database operations
            using (var scope = sp.CreateScope())
            {
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<PersonifiDbContext>();
                var logger = scopedServices.GetRequiredService<
                    ILogger<CustomWebApplicationFactory<TStartup>>
                >();

                // Ensure database is created
                db.Database.EnsureCreated();

                try
                {
                    // Seed test data
                    SeedTestData(db);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred seeding the database");
                }
            }
        });
    }

    private void SeedTestData(PersonifiDbContext context)
    {
        // Add test categories
        var categories = new[]
        {
            new Category
            {
                Id = 1,
                Name = "Food",
                Type = CategoryType.Expense,
                UserId = "test-user-id",
            },
            new Category
            {
                Id = 2,
                Name = "Transport",
                Type = CategoryType.Expense,
                UserId = "test-user-id",
            },
            new Category
            {
                Id = 3,
                Name = "Salary",
                Type = CategoryType.Income,
                UserId = "test-user-id",
            },
        };
        context.Categories.AddRange(categories);

        // Add test transactions for pagination testing
        var transactions = new List<Transaction>();
        var random = new Random(42); // Seed for reproducible tests

        for (int i = 1; i <= 25; i++)
        {
            transactions.Add(
                new Transaction
                {
                    Id = i,
                    UserId = "test-user-id",
                    Amount = random.Next(10, 1000),
                    Description = $"Transaction {i}",
                    TransactionDate = DateTime.Now.AddDays(-i),
                    CategoryId = categories[random.Next(categories.Length)].Id,
                    CreatedAt = DateTime.Now,
                }
            );
        }

        context.Transactions.AddRange(transactions);
        context.SaveChanges();
    }
}
