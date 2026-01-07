namespace PersonifiBackend.Core.Entities;

public class Account
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // New subscription-based field
    public int? SubscriptionId { get; set; }

    // Navigation properties
    public Subscription? Subscription { get; set; }
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<Bucket> Buckets { get; set; } = new List<Bucket>();
    public ICollection<InvitationToken> InvitationTokens { get; set; } = new List<InvitationToken>();
}