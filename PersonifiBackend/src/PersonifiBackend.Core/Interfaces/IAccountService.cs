using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface IAccountService
{
    /// <summary>
    /// Gets or creates a user with a fully initialized account in a single atomic operation.
    /// If the user doesn't exist, creates the user, account, subscription, and default categories/budgets.
    /// Handles race conditions where multiple requests try to create the same user simultaneously.
    /// </summary>
    Task<User> GetOrCreateUserWithAccountAsync(string auth0UserId, string email);

    Task<User?> GetOrCreateUserAsync(string auth0UserId, string email);
    Task<Account> CreateAccountAsync(string name, string? signupSource = null);
    Task<Account> CreateAccountWithSubscriptionAsync(string name, int ownerUserId, string? signupSource = null);
    Task<Account?> GetUserPrimaryAccountAsync(int userId);
    Task<List<Account>> GetUserAccountsAsync(int userId);
    Task<List<User>> GetAccountMembersAsync(int accountId);
    Task<bool> HasUserAccessToAccountAsync(int userId, int accountId);
    Task AddUserToAccountAsync(int userId, int accountId);
    Task RemoveUserFromAccountAsync(int userId, int accountId);
    Task<InvitationToken> CreateInvitationAsync(int accountId, int inviterUserId, string? email, string? personalMessage = null);
    Task<InvitationToken?> GetValidInvitationAsync(string token);
    Task<AcceptInvitationResult> AcceptInvitationAsync(string token, int acceptingUserId);
    Task<InvitationDetailsDto?> GetInvitationDetailsAsync(string token, int userId);
    Task ArchiveAccountAsync(int accountId);
}
