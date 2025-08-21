namespace PersonifiBackend.Core.Entities;

public class PendingTransaction
{
    public int Id { get; set; }
    public string ExternalTransactionId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string CounterParty { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal? Balance { get; set; }
    public string? ExternalSpendingCategory { get; set; }
    public string? Notes { get; set; }
    public DateTime TransactionDate { get; set; }
    public PendingTransactionStatus Status { get; set; } = PendingTransactionStatus.Pending;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

    public int ImportedByUserId { get; set; }
    public User ImportedByUser { get; set; } = null!;

    public int TransactionImportId { get; set; }
    public TransactionImport TransactionImport { get; set; } = null!;

    public string? RawData { get; set; }
}

public enum PendingTransactionStatus
{
    Pending,
    Approved,
    Rejected,
    Duplicate,
    PotentialDuplicate
}