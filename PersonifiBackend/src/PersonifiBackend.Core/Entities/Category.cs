namespace PersonifiBackend.Core.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public CategoryType Type { get; set; }

    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;

    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
}

public enum CategoryType
{
    Income,
    Expense
}