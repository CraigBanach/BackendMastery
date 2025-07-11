using AutoMapper;
using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Application.Helpers;

public static class PaginationHelper
{
    public static PagedResponse<TDto> CreatePagedResponse<TEntity, TDto>(
        PaginationResult<TEntity> paginationResult,
        PaginationRequest request,
        IMapper mapper
    )
    {
        var dtos = mapper.Map<IEnumerable<TDto>>(paginationResult.Items);

        return new PagedResponse<TDto>(
            dtos,
            paginationResult.TotalCount,
            request.Page,
            request.PageSize
        );
    }

    public static PagedResponse<T> CreatePagedResponse<T>(
        IEnumerable<T> items,
        int totalCount,
        int page,
        int pageSize
    )
    {
        return new PagedResponse<T>(items, totalCount, page, pageSize);
    }
}
