using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Services;
using System.Security.Claims;

namespace PersonifiBackend.Api.Middleware;

public class UserContextMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UserContextMiddleware> _logger;

    public UserContextMiddleware(RequestDelegate next, ILogger<UserContextMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IUserContext userContext, IAccountService accountService)
    {
        // Check if user is authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // Extract user ID from Auth0 claims (try multiple claim types)
            var auth0UserId = context.User.Identity.Name ?? 
                             context.User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value ??
                             context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            // Extract email from Auth0 claims
            var email = context.User.Claims.FirstOrDefault(c => c.Type == "email")?.Value ??
                       context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            // Debug: Log all claims to help diagnose missing email
            if (string.IsNullOrEmpty(email))
            {
                var allClaims = string.Join(", ", context.User.Claims.Select(c => $"{c.Type}={c.Value}"));
                _logger.LogWarning("No email claim found. Available claims: {Claims}", allClaims);
            }
            else
            {
                _logger.LogInformation("Email claim found: {Email}", email);
            }

            if (!string.IsNullOrEmpty(auth0UserId))
            {
                // Cast to implementation to set values
                if (userContext is UserContext userContextImpl)
                {
                    userContextImpl.Auth0UserId = auth0UserId;

                    try
                    {
                        // Get or create user with account atomically
                        // This ensures user always has a fully initialized account
                        var user = await accountService.GetOrCreateUserWithAccountAsync(
                            auth0UserId,
                            email ?? string.Empty
                        );

                        userContextImpl.UserId = user.Id;
                        userContextImpl.AccountId = user.Subscription!.AccountId;

                        _logger.LogDebug(
                            "User context set - UserId: {UserId}, AccountId: {AccountId}",
                            user.Id,
                            user.Subscription.AccountId
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(
                            ex,
                            "Error setting up user context for Auth0 user {Auth0UserId}",
                            auth0UserId
                        );
                    }
                }
            }
            else
            {
                _logger.LogWarning("Authenticated user without 'sub' claim");
            }
        }

        await _next(context);
    }
}
