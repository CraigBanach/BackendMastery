using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using PersonifiBackend.Api.Controllers;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Tests.Controllers;

public class CategoryControllerTests
{
    private readonly Mock<ICategoryService> _serviceMock = new();
    private readonly Mock<IUserContext> _userContextMock = new();
    private readonly Mock<ILogger<CategoryController>> _loggerMock = new();
    private readonly CategoryController _controller;

    public CategoryControllerTests()
    {
        _userContextMock.SetupGet(u => u.UserId).Returns("user1");
        _controller = new CategoryController(
            _serviceMock.Object,
            _userContextMock.Object,
            _loggerMock.Object
        );
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetById_ReturnsOk_WhenFound()
    {
        _serviceMock
            .Setup(s => s.GetByIdAsync(1, "user1"))
            .ReturnsAsync(new CategoryDto(1, "TestCategory", CategoryType.Expense, null, null));

        var result = await _controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(1, ((CategoryDto)okResult.Value!).Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetById_ReturnsNotFound_WhenNull()
    {
        _serviceMock.Setup(s => s.GetByIdAsync(1, "user1")).ReturnsAsync((CategoryDto?)null);

        var result = await _controller.GetById(1);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetUserCategories_ReturnsOk_WhenFound()
    {
        var categories = new List<CategoryDto>
        {
            new CategoryDto(1, "Category1", CategoryType.Expense, null, null),
            new CategoryDto(2, "Category2", CategoryType.Income, null, null),
        };
        _serviceMock.Setup(s => s.GetUserCategoriesAsync("user1")).ReturnsAsync(categories);

        var result = await _controller.GetUserCategories();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedCategories = Assert.IsAssignableFrom<IEnumerable<CategoryDto>>(okResult.Value);
        Assert.Equal(2, returnedCategories.Count());
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task Create_ReturnsCreatedAtAction()
    {
        var dto = new CreateCategoryDto("NewCategory", CategoryType.Income, null, null);
        var created = new CategoryDto(2, "NewCategory", CategoryType.Income, null, null);
        _serviceMock.Setup(s => s.CreateAsync(dto, "user1")).ReturnsAsync(created);

        var result = await _controller.Create(dto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(2, ((CategoryDto)createdResult.Value!).Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task Update_ReturnsOk_WhenUpdated()
    {
        var dto = new UpdateCategoryDto("UpdatedCategory", CategoryType.Expense, null, null);
        var updated = new CategoryDto(1, "UpdatedCategory", CategoryType.Expense, null, null);
        _serviceMock.Setup(s => s.UpdateAsync(1, dto, "user1")).ReturnsAsync(updated);

        var result = await _controller.Update(1, dto);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(1, ((CategoryDto)okResult.Value!).Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task Update_ReturnsNotFound_WhenNull()
    {
        var dto = new UpdateCategoryDto("UpdatedCategory", CategoryType.Expense, null, null);
        _serviceMock.Setup(s => s.UpdateAsync(1, dto, "user1")).ReturnsAsync((CategoryDto?)null);
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

    [Fact]
    [Trait("Category", "Unit")]
    public async Task Delete_ReturnsNotFound_WhenNotFound()
    {
        _serviceMock.Setup(s => s.DeleteAsync(1, "user1")).ReturnsAsync(false);

        var result = await _controller.Delete(1);

        Assert.IsType<NotFoundResult>(result);
    }
}
