using PersonifiBackend.Api.Tests.Fixtures;
using PersonifiBackend.Core.DTOs;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PersonifiBackend.Api.Tests.Integration;

public class TransactionIntegrationTests : IntegrationTestBase
{
    private static readonly JsonSerializerOptions jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() },
    };

    public TransactionIntegrationTests(CustomWebApplicationFactory<Program> factory)
        : base(factory) { }

    [Fact(Skip = "todo")]
    public async Task GetTransactions_WithPagination_ReturnsCorrectPage()
    {
        // Act
        var response = await Client.GetAsync(
            "/api/transaction?page=2&pageSize=10&sortBy=amount&sortDescending=true"
        );

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadFromJsonAsync<PagedResponse<TransactionDto>>(
            jsonOptions
        );
        Assert.NotNull(content);
        Assert.Equal(2, content.CurrentPage);
        Assert.Equal(10, content.PageSize);
        Assert.Equal(10, content.Items.Count()); // We have 25 total, so page 2 has 10
        Assert.Equal(25, content.TotalCount);
        Assert.Equal(3, content.TotalPages); // 25 items / 10 per page = 3 pages

        // Verify sorting
        var amounts = content.Items.Select(t => t.Amount).ToList();
        Assert.True(amounts.SequenceEqual(amounts.OrderByDescending(a => a)));

        // Check headers
        Assert.True(response.Headers.Contains("X-Total-Count"));
        Assert.True(response.Headers.Contains("X-Current-Page"));
        Assert.Equal("25", response.Headers.GetValues("X-Total-Count").First());
        Assert.Equal("2", response.Headers.GetValues("X-Current-Page").First());
    }

    [Fact(Skip = "todo")]
    public async Task GetTransactions_LastPage_ReturnsPartialResults()
    {
        // Act - page 3 should have only 5 items (25 total / 10 per page)
        var response = await Client.GetAsync("/api/transaction?page=3&pageSize=10");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadFromJsonAsync<PagedResponse<TransactionDto>>(
            jsonOptions
        );
        Assert.NotNull(content);
        Assert.Equal(3, content.CurrentPage);
        Assert.Equal(5, content.Items.Count()); // Last page has only 5 items
        Assert.False(content.HasNext);
        Assert.True(content.HasPrevious);
    }

    [Fact]
    public async Task GetTransactions_InvalidPage_ReturnsEmptyResults()
    {
        // Act - page beyond available data
        var response = await Client.GetAsync("/api/transaction?page=10&pageSize=10");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadFromJsonAsync<PagedResponse<TransactionDto>>(
            jsonOptions
        );
        Assert.NotNull(content);
        Assert.Empty(content.Items);
    }

    [Fact]
    public async Task GetTransactions_WithFilters_ReturnFilteredResults()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddDays(-10);
        var endDate = DateTime.UtcNow.AddDays(-5);

        // Act
        var response = await Client.GetAsync(
            $"/api/transaction?page=1&pageSize=20&startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}"
        );

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadFromJsonAsync<PagedResponse<TransactionDto>>(
            jsonOptions
        );
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
    public async Task CreateTransaction_ReturnsCreatedTransaction()
    {
        // Arrange
        var newTransaction = new CreateTransactionDto(
            Amount: 123.45m,
            Description: "Integration test transaction",
            Notes: "Test notes",
            TransactionDate: DateTime.UtcNow,
            CategoryId: 1
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/transaction", newTransaction);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        //TODO: Ask Claude if there is a way to keep this DRY
        var created = await response.Content.ReadFromJsonAsync<TransactionDto>(jsonOptions);
        Assert.NotNull(created);
        Assert.Equal(123.45m, created.Amount);
        Assert.Equal("Integration test transaction", created.Description);

        // Verify Location header
        Assert.NotNull(response.Headers.Location);
        Assert.Contains($"/api/Transaction/{created.Id}", response.Headers.Location.ToString());
    }

    [Fact(Skip = "todo")]
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
