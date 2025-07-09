using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Infrastructure.Services;

public class UserContext : IUserContext
{
    public string UserId { get; set; } = string.Empty;
    public bool IsAuthenticated => !string.IsNullOrEmpty(UserId);
}
