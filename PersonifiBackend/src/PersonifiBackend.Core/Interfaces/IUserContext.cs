namespace PersonifiBackend.Core.Interfaces;

public interface IUserContext
{
    string UserId { get; }
    bool IsAuthenticated { get; }
}
