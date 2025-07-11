using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string TestBearerToken = "test-auth-valid-token";
    
    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder
    )
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Check if Authorization header is present
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            return Task.FromResult(AuthenticateResult.Fail("Missing Authorization header"));
        }

        var authHeaderValue = authHeader.ToString();
        
        // Check if it's a Bearer token with the correct value
        if (!authHeaderValue.StartsWith("Bearer ") || 
            authHeaderValue.Substring(7) != TestBearerToken)
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid bearer token"));
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "test-user-id"),
            new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
            new Claim("sub", "test-user-id"),
        };

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
