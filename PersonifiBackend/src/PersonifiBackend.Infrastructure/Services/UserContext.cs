using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Infrastructure.Services;

public class UserContext : IUserContext
{
    private readonly IAccountService _accountService;

    public UserContext(IAccountService accountService)
    {
        _accountService = accountService;
    }

    public string Auth0UserId { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public int? AccountId { get; set; }
    public bool IsAuthenticated => !string.IsNullOrEmpty(Auth0UserId);

    public async Task<bool> HasAccessToAccountAsync(int accountId)
    {
        if (!UserId.HasValue)
            return false;

        return await _accountService.HasUserAccessToAccountAsync(UserId.Value, accountId);
    }
}
