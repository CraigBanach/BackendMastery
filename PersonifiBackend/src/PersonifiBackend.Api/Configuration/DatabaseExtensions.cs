using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.Configuration;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Api.Configuration;

public static class DatabaseExtensions
{
    /// <summary>
    /// Configures Entity Framework Core with PostgreSQL and health checks
    /// </summary>
    public static WebApplicationBuilder AddDatabase(this WebApplicationBuilder builder)
    {
        // Add Database (skip for Testing environment)
        if (!builder.Environment.IsEnvironment("Testing"))
        {
            builder.Services.AddDbContext<PersonifiDbContext>(options =>
            {
                var dbConnectionString =
                    builder
                        .Configuration.GetSection(DatabaseOptions.SectionName)
                        .Get<DatabaseOptions>()
                        ?.ConnectionString
                    ?? throw new InvalidOperationException(
                        "Database connection string is not configured."
                    );

                options.UseNpgsql(dbConnectionString);
            });
        }

        // Add Health Checks
        builder.Services.AddHealthChecks().AddDbContextCheck<PersonifiDbContext>();

        return builder;
    }

    /// <summary>
    /// Ensures database is created and applies pending migrations
    /// </summary>
    public static WebApplication EnsureDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();

        // Skip migration for in-memory database (used in testing)
        if (context.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
        {
            context.Database.Migrate();
        }

        return app;
    }
}
