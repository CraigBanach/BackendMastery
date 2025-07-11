using Microsoft.OpenApi.Models;
using System.Reflection;

namespace PersonifiBackend.Api.Configuration;

public static class SwaggerExtensions
{
    /// <summary>
    /// Configures Swagger/OpenAPI documentation with JWT authentication
    /// </summary>
    public static WebApplicationBuilder AddSwagger(this WebApplicationBuilder builder)
    {
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            // Configure API documentation
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Personifi Backend API",
                Version = "v1",
                Description = "A financial management API for tracking transactions and categories"
            });

            // Include XML documentation
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }

            // Add JWT authentication to Swagger
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return builder;
    }
}