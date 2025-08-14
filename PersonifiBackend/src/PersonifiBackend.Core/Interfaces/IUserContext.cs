namespace PersonifiBackend.Core.Interfaces;

public interface IUserContext
{
    string Auth0UserId { get; }
    int? UserId { get; }
    int? AccountId { get; }
    bool IsAuthenticated { get; }
    Task<bool> HasAccessToAccountAsync(int accountId);
}
