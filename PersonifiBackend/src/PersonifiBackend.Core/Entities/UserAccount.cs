namespace PersonifiBackend.Core.Entities;

public class UserAccount
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;

    public DateTime JoinedAt { get; set; }
}