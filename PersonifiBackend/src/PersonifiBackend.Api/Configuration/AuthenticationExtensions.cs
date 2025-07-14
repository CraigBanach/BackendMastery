using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PersonifiBackend.Core.Configuration;
using System.Security.Claims;

namespace PersonifiBackend.Api.Configuration;

public static class AuthenticationExtensions
{
    /// <summary>
    /// Configures JWT Bearer authentication with Auth0
    /// </summary>
    public static WebApplicationBuilder AddAuthentication(this WebApplicationBuilder builder)
    {
        // Configure Auth0 options
        builder.Services.Configure<Auth0Options>(
            builder.Configuration.GetSection(Auth0Options.SectionName)
        );

        // Add JWT Bearer authentication
        builder.Services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var auth0Options = builder.Configuration
                    .GetSection(Auth0Options.SectionName)
                    .Get<Auth0Options>()
                    ?? throw new InvalidOperationException("Auth0 configuration is missing or invalid.");

                options.Authority = auth0Options.Domain
                    ?? throw new InvalidOperationException("Auth0 Domain is not configured.");
                
                options.Audience = auth0Options.Audience
                    ?? throw new InvalidOperationException("Auth0 Audience is not configured.");
                
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    NameClaimType = ClaimTypes.NameIdentifier,
                };
            });

        return builder;
    }
}