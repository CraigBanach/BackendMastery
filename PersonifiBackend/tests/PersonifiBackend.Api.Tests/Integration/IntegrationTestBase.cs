using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PersonifiBackend.Api.Tests.Fixtures;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Infrastructure.Data;

public abstract class IntegrationTestBase
    : IClassFixture<CustomWebApplicationFactory<Program>>,
        IDisposable
{
    protected readonly CustomWebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;
    protected const string TestUserId = "test-user-id";

    protected IntegrationTestBase(CustomWebApplicationFactory<Program> factory)
    {
        Factory = factory;
        Client = Factory.CreateClient(
            new WebApplicationFactoryClientOptions { AllowAutoRedirect = false }
        );

        // Set default auth header with bearer token
        Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", TestAuthHandler.TestBearerToken);
    }

    protected async Task<List<Transaction>> SeedTestTransactionsAsync(int count)
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();
        var testDataBuilder = new TestDataBuilder(context);

        // Clean up existing test data
        await CleanupTestDataAsync();

        // Create test categories if they don't exist
        await EnsureTestCategoriesExistAsync();

        return await testDataBuilder.CreateTransactionsAsync(TestUserId, count);
    }

    protected async Task CleanupTestDataAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();

        // Remove test user's transactions
        var transactions = context.Transactions.Where(t => t.UserId == TestUserId);
        context.Transactions.RemoveRange(transactions);
        await context.SaveChangesAsync();
    }

    private async Task EnsureTestCategoriesExistAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();

        var existingCategories = await context
            .Categories.Where(c => c.UserId == TestUserId)
            .CountAsync();

        if (existingCategories == 0)
        {
            var categories = new[]
            {
                new Category { Name = "Food", UserId = TestUserId },
                new Category { Name = "Transport", UserId = TestUserId },
                new Category { Name = "Entertainment", UserId = TestUserId },
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }
    }

    public void Dispose()
    {
        Client?.Dispose();
    }
}
