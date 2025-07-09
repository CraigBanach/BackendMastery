using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Services;

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

    public async Task InvokeAsync(HttpContext context, IUserContext userContext)
    {
        // Check if user is authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // Extract user ID from the 'sub' claim (Auth0 standard)
            var userId = context.User.Identity.Name;

            if (!string.IsNullOrEmpty(userId))
            {
                // Cast to implementation to set values
                if (userContext is UserContext userContextImpl)
                {
                    userContextImpl.UserId = userId;

                    _logger.LogDebug("User context set for user {UserId}", userId);
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
