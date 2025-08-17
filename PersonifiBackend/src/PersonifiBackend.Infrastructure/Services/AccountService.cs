using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Infrastructure.Services;

public class AccountService : IAccountService
{
    private readonly PersonifiDbContext _context;
    private readonly ILogger<AccountService> _logger;

    public AccountService(PersonifiDbContext context, ILogger<AccountService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<User?> GetOrCreateUserAsync(string auth0UserId, string email)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Auth0UserId == auth0UserId);

        if (user == null)
        {
            user = new User
            {
                Auth0UserId = auth0UserId,
                Email = email,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new user for Auth0 ID: {Auth0UserId}", auth0UserId);
        }

        return user;
    }

    public async Task<Account> CreateAccountAsync(string name)
    {
        var account = new Account
        {
            Name = name,
            CreatedAt = DateTime.UtcNow
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        return account;
    }

    public async Task<Account?> GetUserPrimaryAccountAsync(int userId)
    {
        // Get the user's first account (could be enhanced with primary account concept later)
        return await _context.UserAccounts
            .Where(ua => ua.UserId == userId)
            .Select(ua => ua.Account)
            .OrderBy(a => a.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Account>> GetUserAccountsAsync(int userId)
    {
        return await _context.UserAccounts
            .Where(ua => ua.UserId == userId)
            .Select(ua => ua.Account)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> HasUserAccessToAccountAsync(int userId, int accountId)
    {
        return await _context.UserAccounts
            .AnyAsync(ua => ua.UserId == userId && ua.AccountId == accountId);
    }

    public async Task AddUserToAccountAsync(int userId, int accountId)
    {
        var existingUserAccount = await _context.UserAccounts
            .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AccountId == accountId);

        if (existingUserAccount == null)
        {
            var userAccount = new UserAccount
            {
                UserId = userId,
                AccountId = accountId,
                JoinedAt = DateTime.UtcNow
            };

            _context.UserAccounts.Add(userAccount);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<InvitationToken> CreateInvitationAsync(int accountId, int inviterUserId, string email, string? personalMessage = null)
    {
        var token = GenerateInvitationToken();
        var invitation = new InvitationToken
        {
            Token = token,
            Email = email,
            PersonalMessage = personalMessage,
            AccountId = accountId,
            InviterUserId = inviterUserId,
            ExpiresAt = DateTime.UtcNow.AddDays(7), // Hard-coded 7 days as requested
            CreatedAt = DateTime.UtcNow
        };

        _context.InvitationTokens.Add(invitation);
        await _context.SaveChangesAsync();

        return invitation;
    }

    public async Task<InvitationToken?> GetValidInvitationAsync(string token)
    {
        _logger.LogInformation("Looking for invitation with token: {Token}", token);
        
        var currentTime = DateTime.UtcNow;
        var invitation = await _context.InvitationTokens
            .Include(i => i.Account)
            .Include(i => i.InviterUser)
            .FirstOrDefaultAsync(i => i.Token == token && !i.IsAccepted && i.ExpiresAt > currentTime);
            
        _logger.LogInformation("Invitation found: {Found}, Email: {Email}, IsAccepted: {IsAccepted}, ExpiresAt: {ExpiresAt}", 
            invitation != null, invitation?.Email, invitation?.IsAccepted, invitation?.ExpiresAt);
            
        return invitation;
    }

    public async Task<bool> AcceptInvitationAsync(string token, int acceptingUserId)
    {
        var currentTime = DateTime.UtcNow;
        var invitation = await _context.InvitationTokens
            .FirstOrDefaultAsync(i => i.Token == token && !i.IsAccepted && i.ExpiresAt > currentTime);

        if (invitation == null)
            return false;

        // Mark invitation as accepted
        invitation.IsAccepted = true;
        invitation.AcceptedAt = DateTime.UtcNow;
        invitation.AcceptedByUserId = acceptingUserId;

        // Add user to account
        await AddUserToAccountAsync(acceptingUserId, invitation.AccountId);

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} accepted invitation {InvitationId} to account {AccountId}", 
            acceptingUserId, invitation.Id, invitation.AccountId);

        return true;
    }

    private static string GenerateInvitationToken()
    {
        // Generate a URL-safe token
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
}