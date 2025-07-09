using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using PersonifiBackend.Api.Middleware;
using PersonifiBackend.Infrastructure.Services;

namespace PersonifiBackend.Api.Tests.Middleware;

public class UserContextMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_WithAuthenticatedUser_SetsUserContext()
    {
        // Arrange
        var userContext = new UserContext();
        var logger = new Mock<ILogger<UserContextMiddleware>>();
        var middleware = new UserContextMiddleware(
            next: (innerHttpContext) => Task.CompletedTask,
            logger: logger.Object
        );

        var context = new DefaultHttpContext();
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, "auth0|123456"), // This sets Identity.Name
            new Claim("sub", "auth0|123456"),
            new Claim("email", "test@example.com"),
        };
        // The "authenticationType" parameter is important - it makes IsAuthenticated return true
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        context.User = principal;

        // Act
        await middleware.InvokeAsync(context, userContext);

        // Assert
        Assert.True(userContext.IsAuthenticated);
        Assert.Equal("auth0|123456", userContext.UserId);
        // Also verify that Identity.Name is set correctly
        Assert.Equal("auth0|123456", context.User.Identity?.Name);
    }

    [Fact]
    public async Task InvokeAsync_WithUnauthenticatedUser_DoesNotSetUserContext()
    {
        // Arrange
        var userContext = new UserContext();
        var logger = new Mock<ILogger<UserContextMiddleware>>();
        var middleware = new UserContextMiddleware(
            next: (innerHttpContext) => Task.CompletedTask,
            logger: logger.Object
        );

        var context = new DefaultHttpContext();

        // Act
        await middleware.InvokeAsync(context, userContext);

        // Assert
        Assert.False(userContext.IsAuthenticated);
        Assert.Equal(string.Empty, userContext.UserId);
    }
}
