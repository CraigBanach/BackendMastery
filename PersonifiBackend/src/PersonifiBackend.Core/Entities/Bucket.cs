namespace PersonifiBackend.Core.Entities;

public class Bucket
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal? TargetAmount { get; set; }

    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;
}
