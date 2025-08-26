namespace PersonifiBackend.Core.Entities;

public class InvitationToken
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty; // Unique token for invitation URL
    public string? Email { get; set; } // Email of invited user (nullable for token-only invitations)
    public string? PersonalMessage { get; set; } // Optional message from inviter
    public DateTime ExpiresAt { get; set; } // Hard-coded 7 days from creation
    public bool IsAccepted { get; set; } = false;
    public DateTime? AcceptedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;

    public int InviterUserId { get; set; }
    public User InviterUser { get; set; } = null!;

    public int? AcceptedByUserId { get; set; }
    public User? AcceptedByUser { get; set; }

    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
    public bool IsValid => !IsAccepted && !IsExpired;
}