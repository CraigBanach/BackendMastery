using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using PersonifiBackend.Api.Controllers;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Tests.Controllers;

public class TransactionControllerTests
{
    private readonly Mock<ITransactionService> _serviceMock = new();
    private readonly Mock<IUserContext> _userContextMock = new();
    private readonly Mock<ILogger<TransactionController>> _loggerMock = new();
    private readonly TransactionController _controller;

    public TransactionControllerTests()
    {
        _userContextMock.SetupGet(u => u.UserId).Returns("user1");
        _controller = new TransactionController(
            _serviceMock.Object,
            _userContextMock.Object,
            _loggerMock.Object
        );
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext(),
        };
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetById_ReturnsOk_WhenFound()
    {
        _serviceMock
            .Setup(s => s.GetByIdAsync(1, "user1"))
            .ReturnsAsync(
                new TransactionDto(
                    1,
                    100.00m,
                    "Test Transaction",
                    "Test Notes",
                    DateTime.Now,
                    new CategoryDto(1, "Test Category", CategoryType.Expense, null, null),
                    DateTime.Now
                )
            );

        var result = await _controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(1, ((TransactionDto)okResult.Value!).Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetById_ReturnsNotFound_WhenNull()
    {
        _serviceMock.Setup(s => s.GetByIdAsync(1, "user1")).ReturnsAsync((TransactionDto?)null);

        var result = await _controller.GetById(1);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetUserTransactions_ReturnsOk_WhenFound()
    {
        var transactions = new List<TransactionDto>
        {
            new TransactionDto(
                1,
                100.00m,
                "Transaction 1",
                "Notes 1",
                DateTime.Now,
                new CategoryDto(1, "Category 1", CategoryType.Expense, null, null),
                DateTime.Now
            ),
            new TransactionDto(
                2,
                200.00m,
                "Transaction 2",
                "Notes 2",
                DateTime.Now,
                new CategoryDto(2, "Category 2", CategoryType.Income, null, null),
                DateTime.Now
            ),
        };
        var paginationRequest = new PaginationRequest { Page = 1, PageSize = 20 };
        _serviceMock
            .Setup(s => s.GetUserTransactionsAsync("user1", paginationRequest, null, null, null))
            .ReturnsAsync(new PagedResponse<TransactionDto>(transactions, 2, 1, 20));

        var result = await _controller.GetUserTransactions(paginationRequest, null, null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returned = Assert.IsType<PagedResponse<TransactionDto>>(okResult.Value);

        Assert.Equal(2, returned.Items.Count());
        Assert.Equal(1, returned.CurrentPage);
        Assert.Equal(20, returned.PageSize);
        Assert.Equal(2, returned.TotalCount);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task Create_ReturnsCreatedAtAction()
    {
        var dto = new CreateTransactionDto(
            100.00m,
            "Test Description",
            "Test Notes",
            DateTime.Now,
            1
        );
        var created = new TransactionDto(
            2, // Id
            100.00m, // Amount
            "Test Description", // Description
            "Test Notes", // Notes
            DateTime.Now, // TransactionDate
            new CategoryDto(1, "Test Category", CategoryType.Expense, null, null), // Category
            DateTime.Now // CreatedAt
        );
        _serviceMock.Setup(s => s.CreateAsync(dto, "user1")).ReturnsAsync(created);

        var result = await _controller.Create(dto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(2, ((TransactionDto)createdResult.Value!).Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task Update_ReturnsOk_WhenUpdated()
    {
        var dto = new UpdateTransactionDto(
            150.00m, // Amount
            "Updated Description", // Description
            "Updated Notes", // Notes
            DateTime.Now, // TransactionDate
            1 // CategoryId
        );
        var updated = new TransactionDto(
            1, // Id
            150.00m, // Amount
            "Updated Description", // Description
            "Updated Notes", // Notes
            DateTime.Now, // TransactionDate
            new CategoryDto(1, "Test Category", CategoryType.Expense, null, null), // Category
            DateTime.Now // CreatedAt
        );
        _serviceMock.Setup(s => s.UpdateAsync(1, dto, "user1")).ReturnsAsync(updated);

        var result = await _controller.Update(1, dto);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(1, ((TransactionDto)okResult.Value!).Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task Update_ReturnsNotFound_WhenNotFound()
    {
        var dto = new UpdateTransactionDto(
            150.00m, // Amount
            "Updated Description", // Description
            "Updated Notes", // Notes
            DateTime.Now, // TransactionDate
            1 // CategoryId
        );
        _serviceMock.Setup(s => s.UpdateAsync(1, dto, "user1")).ReturnsAsync((TransactionDto?)null);

        var result = await _controller.Update(1, dto);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task Delete_ReturnsNoContent_WhenDeleted()
    {
        _serviceMock.Setup(s => s.DeleteAsync(1, "user1")).ReturnsAsync(true);

        var result = await _controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
    }
}
