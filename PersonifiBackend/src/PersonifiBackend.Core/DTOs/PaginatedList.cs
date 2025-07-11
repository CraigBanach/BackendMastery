namespace PersonifiBackend.Core.DTOs;

public class PaginationResult<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }

    public PaginationResult(List<T> items, int totalCount)
    {
        Items = items;
        TotalCount = totalCount;
    }
}
