using AutoMapper;
using Microsoft.Extensions.Logging;
using Moq;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Tests.Services;

public class TransactionServiceTests
{
    private readonly Mock<ITransactionRepository> _repoMock = new();
    private readonly Mock<IMapper> _mapperMock = new();
    private readonly Mock<ILogger<TransactionService>> _loggerMock = new();
    private readonly TransactionService _service;

    public TransactionServiceTests()
    {
        _service = new TransactionService(_repoMock.Object, _mapperMock.Object, _loggerMock.Object);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetByIdAsync_ReturnsTransactionDto_WhenFound()
    {
        var transaction = new Transaction { Id = 1, UserId = "user1" };
        var dto = new TransactionDto(
            1,
            100.00m,
            "Test Transaction",
            null,
            DateTime.UtcNow,
            new CategoryDto(1, "Test Category", CategoryType.Expense, null, null), // Fixed the constructor call
            DateTime.UtcNow
        );
        _repoMock.Setup(r => r.GetByIdAsync(1, "user1")).ReturnsAsync(transaction);
        _mapperMock.Setup(m => m.Map<TransactionDto>(transaction)).Returns(dto);

        var result = await _service.GetByIdAsync(1, "user1");

        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(1, "user1")).ReturnsAsync((Transaction?)null);

        var result = await _service.GetByIdAsync(1, "user1");

        Assert.Null(result);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task CreateAsync_MapsAndCreatesTransaction()
    {
        var dto = new CreateTransactionDto(
            100.00m,
            "Test Description",
            "Test Notes",
            DateTime.UtcNow,
            1
        );
        var transaction = new Transaction { UserId = "user1" };
        var created = new Transaction { Id = 2, UserId = "user1" };
        var resultDto = new TransactionDto(
            2,
            100.00m,
            "Test Description",
            "Test Notes",
            DateTime.UtcNow,
            new CategoryDto(1, "Test Category", CategoryType.Expense, null, null),
            DateTime.UtcNow
        );

        _mapperMock.Setup(m => m.Map<Transaction>(dto)).Returns(transaction);
        _repoMock.Setup(r => r.CreateAsync(transaction)).ReturnsAsync(created);
        _mapperMock.Setup(m => m.Map<TransactionDto>(created)).Returns(resultDto);

        var result = await _service.CreateAsync(dto, "user1");

        Assert.Equal(2, result.Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task UpdateAsync_ReturnsMappedDto()
    {
        var updateDto = new UpdateTransactionDto(
            100.00m,
            "Updated Description",
            "Updated Notes",
            DateTime.UtcNow,
            1
        );
        var existingTransaction = new Transaction
        {
            Id = 1,
            UserId = "user1",
            Amount = 50.00m,
            Description = "Old Description",
            Notes = "Old Notes",
        };

        // Setup the existing transaction to be found
        _repoMock.Setup(r => r.GetByIdAsync(1, "user1")).ReturnsAsync(existingTransaction);

        // Setup mapper to map updates onto existing transaction
        _mapperMock.Setup(m => m.Map(updateDto, existingTransaction)).Returns(existingTransaction);

        // Setup the update to return the updated transaction
        _repoMock.Setup(r => r.UpdateAsync(existingTransaction)).ReturnsAsync(existingTransaction);

        // Setup the final DTO mapping
        var resultDto = new TransactionDto(
            1,
            100.00m,
            "Updated Description",
            "Updated Notes",
            DateTime.UtcNow,
            new CategoryDto(1, "Test Category", CategoryType.Expense, null, null),
            DateTime.UtcNow
        );
        _mapperMock.Setup(m => m.Map<TransactionDto>(existingTransaction)).Returns(resultDto);

        var result = await _service.UpdateAsync(1, updateDto, "user1");

        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        _mapperMock.Verify(m => m.Map(updateDto, existingTransaction), Times.Once());
        _repoMock.Verify(r => r.UpdateAsync(existingTransaction), Times.Once());
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task UpdateAsync_ReturnsNull_WhenNotFound()
    {
        var updateDto = new UpdateTransactionDto(
            100.00m, // Amount
            "Updated Description", // Description
            "Updated Notes", // Notes
            DateTime.UtcNow, // TransactionDate
            1 // CategoryId
        );

        _repoMock.Setup(r => r.GetByIdAsync(1, "user1")).ReturnsAsync((Transaction?)null);

        var result = await _service.UpdateAsync(1, updateDto, "user1");

        Assert.Null(result);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task DeleteAsync_ReturnsTrue_WhenDeleted()
    {
        _repoMock.Setup(r => r.DeleteAsync(1, "user1")).ReturnsAsync(true);

        var result = await _service.DeleteAsync(1, "user1");

        Assert.True(result);
    }
}
