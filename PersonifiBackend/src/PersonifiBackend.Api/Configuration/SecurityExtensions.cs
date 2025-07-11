using Microsoft.AspNetCore.Server.Kestrel.Core;

namespace PersonifiBackend.Api.Configuration;

public static class SecurityExtensions
{
    /// <summary>
    /// Configures Kestrel server security settings
    /// </summary>
    public static WebApplicationBuilder AddSecurity(this WebApplicationBuilder builder)
    {
        // Configure Kestrel for security
        builder.Services.Configure<KestrelServerOptions>(options =>
        {
            options.Limits.MaxRequestBodySize = 1_048_576; // 1MB limit
            options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(30);
        });

        return builder;
    }
}