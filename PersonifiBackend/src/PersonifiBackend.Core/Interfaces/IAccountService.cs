using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Core.Interfaces;

public interface IAccountService
{
    Task<User?> GetOrCreateUserAsync(string auth0UserId, string email);
    Task<Account> CreateAccountAsync(string name);
    Task<Account?> GetUserPrimaryAccountAsync(int userId);
    Task<List<Account>> GetUserAccountsAsync(int userId);
    Task<bool> HasUserAccessToAccountAsync(int userId, int accountId);
    Task AddUserToAccountAsync(int userId, int accountId);
    Task<InvitationToken> CreateInvitationAsync(int accountId, int inviterUserId, string? email, string? personalMessage = null);
    Task<InvitationToken?> GetValidInvitationAsync(string token);
    Task<bool> AcceptInvitationAsync(string token, int acceptingUserId);
}