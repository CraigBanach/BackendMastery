namespace PersonifiBackend.Core.Exceptions;

public class CategoryAlreadyExistsException : Exception
{
    public CategoryAlreadyExistsException()
        : base("A category with that name already exists.") { }
}
