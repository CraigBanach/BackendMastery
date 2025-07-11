using Microsoft.AspNetCore.Mvc.Testing;
using PersonifiBackend.Api.Tests.Fixtures;
using PersonifiBackend.Core.DTOs;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace PersonifiBackend.Api.Tests.Integration;

public class TransactionPaginationTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly string TestAuthToken = "test-jwt-token";

    public TransactionPaginationTests(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    record PagedResponseDto<T>(
        IEnumerable<T> Items,
        int CurrentPage,
        int PageSize,
        int TotalPages,
        int TotalCount
    );

    [Fact]
    public async Task GetTransactions_WithPagination_ReturnsCorrectPage()
    {
        // Arrange
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            TestAuthToken
        );

        // Act
        var response = await client.GetAsync(
            "/api/transaction?page=2&pageSize=10&sortBy=amount&sortDescending=true"
        );

        // Assert
        response.EnsureSuccessStatusCode();

        var dto = await response.Content.ReadFromJsonAsync<PagedResponseDto<TransactionDto>>();

        Assert.NotNull(dto);

        var content = new PagedResponse<TransactionDto>(
            dto.Items,
            dto.TotalCount,
            dto.CurrentPage,
            dto.PageSize
        );

        Assert.Equal(2, content.CurrentPage);
        Assert.Equal(10, content.PageSize);
        Assert.True(content.Items.Count() <= 10);

        // Check headers
        Assert.True(response.Headers.Contains("X-Total-Count"));
        Assert.True(response.Headers.Contains("X-Current-Page"));
    }
}
