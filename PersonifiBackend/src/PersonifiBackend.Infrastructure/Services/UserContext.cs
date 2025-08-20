using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PersonifiBackend.Infrastructure.Services;

public class UserContext : IUserContext
{
    private readonly IAccountService _accountService;
    private readonly PersonifiDbContext _dbContext;

    public UserContext(IAccountService accountService, PersonifiDbContext dbContext)
    {
        _accountService = accountService;
        _dbContext = dbContext;
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

    public async Task<bool> DismissInvitePromptAsync()
    {
        if (!UserId.HasValue)
            return false;

        var user = await _dbContext.Users.FindAsync(UserId.Value);
        if (user == null)
            return false;

        user.InvitePromptDismissed = true;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsInvitePromptDismissedAsync()
    {
        if (!UserId.HasValue)
            return false;

        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == UserId.Value);
        
        return user?.InvitePromptDismissed ?? false;
    }
}
