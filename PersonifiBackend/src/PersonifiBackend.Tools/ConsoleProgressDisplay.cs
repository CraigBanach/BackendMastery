namespace PersonifiBackend.Tools;

public class ConsoleProgressDisplay
{
    public void ShowProgress(SeedingProgressStatus status)
    {
        // Color coding and icons for Windows
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.Write("[INFO] ");
        Console.ResetColor();
        
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.Write($"[CAT] {status.CategoriesCompleted}/{status.TotalUsers}");
        Console.ResetColor();
        Console.Write(" | ");
        
        Console.ForegroundColor = ConsoleColor.Green;
        Console.Write($"[TXN] {status.TransactionsCompleted}/{status.TotalTransactions}");
        Console.ResetColor();
        Console.Write(" | ");
        
        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.Write($"[BUD] {status.BudgetsCompleted}/{status.TotalUsers}");
        Console.ResetColor();
        
        Console.WriteLine($" ({status.TransactionPercentage:F1}%)");
    }

    public void ShowCompletion()
    {
        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("✓ Database seeding completed!");
        Console.ResetColor();
    }
}