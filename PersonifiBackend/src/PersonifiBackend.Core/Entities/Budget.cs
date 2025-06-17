namespace PersonifiBackend.Core.Entities;

public class Budget
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}

public enum BudgetPeriod
{
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly
}