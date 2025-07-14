using System.Net;
using System.Net.Http.Json;
using PersonifiBackend.Api.Tests.Extensions;
using PersonifiBackend.Api.Tests.Fixtures;
using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Api.Tests.Integration;

public class TransactionIntegrationTests : IntegrationTestBase
{
    public TransactionIntegrationTests(CustomWebApplicationFactory<Program> factory)
        : base(factory) { }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetTransactions_WithPagination_ReturnsCorrectPage()
    {
        // Act
        var response = await Client.GetAsync(
            "/api/transaction?page=2&pageSize=10&sortBy=amount&sortDescending=true"
        );

        // Assert
        response.EnsureSuccessStatusCode();

        var content = await Client.GetFromJsonAsync<PagedResponse<TransactionDto>>(
            "/api/transaction?page=2&pageSize=10&sortBy=amount&sortDescending=true"
        );

        Assert.NotNull(content);
        Assert.Equal(2, content.CurrentPage);
        Assert.Equal(10, content.PageSize);
        Assert.True(content.Items.Count() <= 10);

        // Check headers
        Assert.True(response.Headers.Contains("X-Total-Count"));
        Assert.True(response.Headers.Contains("X-Current-Page"));
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetTransactions_LastPage_ReturnsPartialResults()
    {
        // Arrange - Create exactly 25 transactions for predictable pagination
        await SeedTestTransactionsAsync(25);

        // Act - page 3 should have only 5 items (25 total / 10 per page)
        var content = await Client.GetFromJsonAsync<PagedResponse<TransactionDto>>(
            "/api/transaction?page=3&pageSize=10"
        );

        // Assert
        Assert.NotNull(content);
        Assert.Equal(3, content.CurrentPage);
        Assert.Equal(10, content.PageSize);
        Assert.Equal(5, content.Items.Count()); // Last page has only 5 items
        Assert.Equal(25, content.TotalCount);
        Assert.Equal(3, content.TotalPages);
        Assert.False(content.HasNext);
        Assert.True(content.HasPrevious);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetTransactions_InvalidPage_ReturnsEmptyResults()
    {
        // Arrange - Create some test data
        await SeedTestTransactionsAsync(5);

        // Act - page beyond available data
        var content = await Client.GetFromJsonAsync<PagedResponse<TransactionDto>>(
            "/api/transaction?page=10&pageSize=10"
        );

        // Assert
        Assert.NotNull(content);
        Assert.Empty(content.Items);
        Assert.Equal(10, content.CurrentPage);
        Assert.Equal(5, content.TotalCount);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetTransactions_WithFilters_ReturnFilteredResults()
    {
        // Arrange - Create test data with known dates
        await SeedTestTransactionsAsync(10);
        var startDate = DateTime.Now.AddDays(-100);
        var endDate = DateTime.Now.AddDays(-50);

        // Act
        var content = await Client.GetFromJsonAsync<PagedResponse<TransactionDto>>(
            $"/api/transaction?page=1&pageSize=20&startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}"
        );

        // Assert
        Assert.NotNull(content);

        // All returned items should be within the date range
        Assert.All(
            content.Items,
            t =>
            {
                Assert.True(t.TransactionDate >= startDate);
                Assert.True(t.TransactionDate <= endDate);
            }
        );
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task CreateTransaction_ReturnsCreatedTransaction()
    {
        // Arrange - Ensure categories exist
        await SeedTestTransactionsAsync(1); // This creates categories
        await CleanupTestDataAsync(); // Clean transactions but keep categories

        var newTransaction = new CreateTransactionDto(
            Amount: 123.45m,
            Description: "Integration test transaction",
            Notes: "Test notes",
            TransactionDate: DateTime.Now,
            CategoryId: 1
        );

        // Act
        var created = await Client.PostFromJsonAsync<CreateTransactionDto, TransactionDto>(
            "/api/transaction",
            newTransaction
        );

        // Assert
        Assert.NotNull(created);
        Assert.Equal(123.45m, created.Amount);
        Assert.Equal("Integration test transaction", created.Description);
        Assert.Equal("Test notes", created.Notes);
        Assert.True(created.Id > 0);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetTransactions_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var unauthorizedClient = Factory.CreateClient();
        // Don't set auth header

        // Act
        var response = await unauthorizedClient.GetAsync("/api/transaction");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
