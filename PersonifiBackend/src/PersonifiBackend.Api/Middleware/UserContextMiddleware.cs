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

    public async Task InvokeAsync(HttpContext context, IUserContext userContext, IAccountService accountService)
    {
        // Check if user is authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // Extract user ID from the 'sub' claim (Auth0 standard)
            var auth0UserId = context.User.Identity.Name;

            if (!string.IsNullOrEmpty(auth0UserId))
            {
                // Cast to implementation to set values
                if (userContext is UserContext userContextImpl)
                {
                    userContextImpl.Auth0UserId = auth0UserId;

                    try
                    {
                        // Get email from claims for user creation if needed
                        var email = context.User.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
                        
                        if (string.IsNullOrEmpty(email))
                        {
                            _logger.LogWarning("Authenticated user without email claim");
                            await _next(context);
                            return;
                        }

                        // Get or create user in our system
                        var user = await accountService.GetOrCreateUserAsync(auth0UserId, email);
                        
                        if (user != null)
                        {
                            userContextImpl.UserId = user.Id;

                            // Get user's primary account (first account they belong to)
                            var primaryAccount = await accountService.GetUserPrimaryAccountAsync(user.Id);
                            
                            // If no account exists, this might be a new user - we'll create account when they make their first transaction
                            if (primaryAccount != null)
                            {
                                userContextImpl.AccountId = primaryAccount.Id;
                            }

                            _logger.LogDebug("User context set for authenticated user - UserId: {UserId}, AccountId: {AccountId}", 
                                user.Id, primaryAccount?.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error setting up user context for Auth0 user {Auth0UserId}", auth0UserId);
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
