using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.DTOs;

public record CreateCategoryDto(
    string Name,
    CategoryType Type,
    string? Icon = null,
    string? Color = null
);

public record UpdateCategoryDto(
    string Name,
    CategoryType Type,
    string? Icon = null,
    string? Color = null
);

public record CategoryDto(int Id, string Name, CategoryType Type, string? Icon, string? Color);
