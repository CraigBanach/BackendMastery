using PersonifiBackend.Api.Filters;
using System.Text.Json.Serialization;

namespace PersonifiBackend.Api.Configuration;

public static class ControllersExtensions
{
    /// <summary>
    /// Configures controllers with filters and JSON serialization options
    /// </summary>
    public static WebApplicationBuilder AddControllers(this WebApplicationBuilder builder)
    {
        builder.Services
            .AddControllers(options =>
            {
                options.Filters.Add<RequireAuthenticatedUserAttribute>();
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        return builder;
    }
}