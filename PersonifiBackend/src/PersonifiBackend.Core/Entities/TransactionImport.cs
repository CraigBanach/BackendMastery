namespace PersonifiBackend.Core.Entities;

public class TransactionImport
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public int TotalTransactions { get; set; }
    public int ProcessedTransactions { get; set; }
    public int ApprovedTransactions { get; set; }
    public int RejectedTransactions { get; set; }
    public int DuplicateTransactions { get; set; }
    public TransactionImportStatus Status { get; set; } = TransactionImportStatus.Processing;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;

    public int ImportedByUserId { get; set; }
    public User ImportedByUser { get; set; } = null!;

    public ICollection<PendingTransaction> PendingTransactions { get; set; } = new List<PendingTransaction>();
}

public enum TransactionImportStatus
{
    Processing,
    Completed,
    Failed
}