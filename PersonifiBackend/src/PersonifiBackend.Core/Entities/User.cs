namespace PersonifiBackend.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Auth0UserId { get; set; } = string.Empty; // Maps to Auth0 'sub' claim
    public string Email { get; set; } = string.Empty; // For invitation purposes
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool InvitePromptDismissed { get; set; } = false;

    // New subscription-based fields
    public int? SubscriptionId { get; set; }
    public string Role { get; set; } = "owner"; // 'owner' or 'member'

    // Navigation properties
    public Subscription? Subscription { get; set; }
    public ICollection<Transaction> CreatedTransactions { get; set; } = new List<Transaction>();
    public ICollection<InvitationToken> SentInvitations { get; set; } = new List<InvitationToken>();
}