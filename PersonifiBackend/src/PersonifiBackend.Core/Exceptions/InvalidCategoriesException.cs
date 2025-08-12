namespace PersonifiBackend.Core.Exceptions;

public class InvalidCategoriesException : Exception
{
    public IEnumerable<int> CategoryIds { get; }

    public InvalidCategoriesException(IEnumerable<int> categoryIds) 
        : base($"Categories not found: {string.Join(", ", categoryIds)}")
    {
        CategoryIds = categoryIds;
    }
}