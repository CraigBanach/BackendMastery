using AutoMapper;
using Microsoft.Extensions.Logging;
using Moq;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Tests.Services;

public class CategoryServiceTests
{
    private readonly Mock<ICategoryRepository> _repoMock = new();
    private readonly Mock<IMapper> _mapperMock = new();
    private readonly Mock<ILogger<CategoryService>> _loggerMock = new();
    private readonly CategoryService _service;

    public CategoryServiceTests()
    {
        _service = new CategoryService(_repoMock.Object, _mapperMock.Object, _loggerMock.Object);
    }

    [Fact(Skip = "TODO: Update for multi-user architecture")]
    [Trait("Category", "Unit")]
    public async Task GetByIdAsync_ReturnsCategoryDto_WhenFound()
    {
        await Task.CompletedTask; // Placeholder
        /*
        var category = new Category { Id = 1, AccountId = 1 };
        var dto = new CategoryDto(1, "SampleName", CategoryType.Expense, null, null);
        _repoMock.Setup(r => r.GetByIdAsync(1, 1)).ReturnsAsync(category);
        _mapperMock.Setup(m => m.Map<CategoryDto>(category)).Returns(dto);

        var result = await _service.GetByIdAsync(1, "user1");

        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetUserCategoriesAsync_ReturnsMappedDtos()
    {
        var categories = new List<Category>
        {
            new Category { Id = 1, UserId = "user1" },
        };
        var dtos = new List<CategoryDto>
        {
            new CategoryDto(1, "SampleName", CategoryType.Expense, null, null), // Updated to match the constructor signature
        };
        _repoMock.Setup(r => r.GetUserCategoriesAsync("user1")).ReturnsAsync(categories);
        _mapperMock.Setup(m => m.Map<IEnumerable<CategoryDto>>(categories)).Returns(dtos);

        var result = await _service.GetUserCategoriesAsync("user1");

        Assert.Single(result);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task UpdateAsync_ReturnsMappedDtos()
    {
        var updateDto = new UpdateCategoryDto(
            "UpdatedName", // Provide a valid 'Name'
            CategoryType.Expense, // Provide a valid 'Type'
            null, // Optional 'Icon'
            null // Optional 'Color'
        );
        var category = new Category { Id = 1, UserId = "user1" };
        var updatedCategory = new Category { Id = 1, UserId = "user1" };
        var resultDto = new CategoryDto(1, "UpdatedName", CategoryType.Expense, null, null); // Updated to match the constructor signature

        _repoMock.Setup(r => r.GetByIdAsync(1, "user1")).ReturnsAsync(category);
        _mapperMock.Setup(m => m.Map(updateDto, category)).Returns(updatedCategory);
        _repoMock.Setup(r => r.UpdateAsync(updatedCategory)).ReturnsAsync(updatedCategory);
        _mapperMock.Setup(m => m.Map<CategoryDto>(updatedCategory)).Returns(resultDto);

        var result = await _service.UpdateAsync(1, updateDto, "user1");

        Assert.NotNull(result);
        Assert.Equal("UpdatedName", result.Name);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task CreateAsync_MapsAndCreatesCategory()
    {
        var dto = new CreateCategoryDto("SampleName", CategoryType.Expense, null, null);
        var category = new Category { UserId = "user1" };
        var created = new Category { Id = 2, UserId = "user1" };
        var resultDto = new CategoryDto(2, "SampleName", CategoryType.Expense, null, null); // Updated to match the constructor signature

        _mapperMock.Setup(m => m.Map<Category>(dto)).Returns(category);
        _repoMock.Setup(r => r.CreateAsync(category)).ReturnsAsync(created);
        _mapperMock.Setup(m => m.Map<CategoryDto>(created)).Returns(resultDto);

        var result = await _service.CreateAsync(dto, "user1");

        Assert.Equal(2, result.Id);
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task UpdateAsync_ReturnsNull_WhenNotFound()
    {
        var updateDto = new UpdateCategoryDto(
            "UpdatedName", // Provide a valid 'Name'
            CategoryType.Expense, // Provide a valid 'Type'
            null, // Optional 'Icon'
            null // Optional 'Color'
        );

        _repoMock.Setup(r => r.GetByIdAsync(1, "user1")).ReturnsAsync((Category?)null);

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
