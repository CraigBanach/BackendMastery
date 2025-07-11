using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.DTOs;

// TODO: Create FluentValidation validator for CreateCategoryDto
public record CreateCategoryDto(
    string Name,
    CategoryType Type,
    string? Icon = null,
    string? Color = null
);

// TODO: Create FluentValidation validator for UpdateCategoryDto
public record UpdateCategoryDto(
    string Name,
    CategoryType Type,
    string? Icon = null,
    string? Color = null
);

public record CategoryDto(int Id, string Name, CategoryType Type, string? Icon, string? Color);
