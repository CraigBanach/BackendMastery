using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Infrastructure.Extensions;

public static class QueryableExtensions
{
    public static async Task<PaginationResult<T>> ToPaginationResultAsync<T>(
        this IQueryable<T> source,
        PaginationRequest pagination
    )
    {
        var count = await source.CountAsync();

        var items = await source
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return new PaginationResult<T>(items, count);
    }
}
