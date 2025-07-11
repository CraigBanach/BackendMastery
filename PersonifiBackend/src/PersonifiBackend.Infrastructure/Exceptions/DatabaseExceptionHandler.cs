using Microsoft.EntityFrameworkCore;
using Npgsql;
using PersonifiBackend.Core.Exceptions;

namespace PersonifiBackend.Infrastructure.Exceptions;

public static class DatabaseExceptionHandler
{
    public static Exception HandleDbException(DbUpdateException ex, string resourceType, string entityName)
    {
        if (ex.InnerException is PostgresException pgEx)
        {
            return pgEx.SqlState switch
            {
                "23505" => new DuplicateResourceException(resourceType, entityName),
                _ => ex
            };
        }

        return ex;
    }
}