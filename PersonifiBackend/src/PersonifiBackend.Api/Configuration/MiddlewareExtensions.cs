using PersonifiBackend.Api.Middleware;

namespace PersonifiBackend.Api.Configuration;

public static class MiddlewareExtensions
{
    /// <summary>
    /// Configures the HTTP request pipeline middleware
    /// </summary>
    public static WebApplication ConfigureMiddleware(this WebApplication app)
    {
        // Configure the HTTP request pipeline
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseCors("AllowPersonifiApp");

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseMiddleware<ErrorHandlingMiddleware>();
        app.UseMiddleware<UserContextMiddleware>();
        // TODO: Add validation middleware to handle validation errors

        app.MapControllers();
        app.MapHealthChecks("/healthz");

        return app;
    }
}