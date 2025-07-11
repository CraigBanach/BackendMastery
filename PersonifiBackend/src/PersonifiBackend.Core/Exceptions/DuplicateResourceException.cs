namespace PersonifiBackend.Core.Exceptions;

public class DuplicateResourceException : Exception
{
    public string ResourceType { get; }
    public string EntityName { get; }
    
    public DuplicateResourceException(string resourceType, string entityName) 
        : base($"{resourceType} with name '{entityName}' already exists")
    {
        ResourceType = resourceType;
        EntityName = entityName;
    }
}