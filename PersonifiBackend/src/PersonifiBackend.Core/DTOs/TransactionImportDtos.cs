namespace PersonifiBackend.Core.DTOs;

public class TransactionImportDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public int TotalTransactions { get; set; }
    public int ProcessedTransactions { get; set; }
    public int ApprovedTransactions { get; set; }
    public int RejectedTransactions { get; set; }
    public int DuplicateTransactions { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class PendingTransactionDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string CounterParty { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal? Balance { get; set; }
    public string? ExternalSpendingCategory { get; set; }
    public string? Notes { get; set; }
    public DateTime TransactionDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApprovePendingTransactionRequest
{
    public int CategoryId { get; set; }
    public string? Notes { get; set; }
}

public class BulkApproveTransactionsRequest
{
    public List<int> TransactionIds { get; set; } = new();
    public int? DefaultCategoryId { get; set; }
}

public class BulkRejectTransactionsRequest
{
    public List<int> TransactionIds { get; set; } = new();
}