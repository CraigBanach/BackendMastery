using PersonifiBackend.Core.Configuration;

namespace PersonifiBackend.Api.Configuration;

public static class CorsExtensions
{
    /// <summary>
    /// Configures CORS policy for the application
    /// </summary>
    public static WebApplicationBuilder AddCors(this WebApplicationBuilder builder)
    {
        // Configure CORS options
        builder.Services.Configure<CorsOptions>(
            builder.Configuration.GetSection(CorsOptions.SectionName)
        );

        // Add CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowPersonifiApp", policy =>
            {
                var corsOptions = builder.Configuration
                    .GetSection(CorsOptions.SectionName)
                    .Get<CorsOptions>()
                    ?? throw new InvalidOperationException("CORS configuration is missing or invalid.");

                policy
                    .WithOrigins(corsOptions.AllowedOrigins ?? new[] { "http://localhost:3000" })
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });

        return builder;
    }
}