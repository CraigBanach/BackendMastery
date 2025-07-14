namespace PersonifiBackend.Tools;

public class SeedingProgressTracker
{
    private readonly int _totalUsers;
    private readonly int _totalTransactions;
    private volatile int _categoriesCompleted;
    private volatile int _transactionsCompleted;
    private volatile int _budgetsCompleted;
    private volatile bool _isCompleted;

    public SeedingProgressTracker(int totalUsers, int transactionsPerUser)
    {
        _totalUsers = totalUsers;
        _totalTransactions = totalUsers * transactionsPerUser;
    }

    public void UpdateCategories(int completed)
    {
        _categoriesCompleted = completed;
    }

    public void UpdateTransactions(int completed)
    {
        _transactionsCompleted = completed;
    }

    public void UpdateBudgets(int completed)
    {
        _budgetsCompleted = completed;
    }

    public void MarkCompleted()
    {
        _isCompleted = true;
    }

    public bool IsCompleted => _isCompleted;

    public SeedingProgressStatus GetCurrentStatus()
    {
        return new SeedingProgressStatus
        {
            CategoriesCompleted = _categoriesCompleted,
            TotalUsers = _totalUsers,
            TransactionsCompleted = _transactionsCompleted,
            TotalTransactions = _totalTransactions,
            BudgetsCompleted = _budgetsCompleted,
            TransactionPercentage = _totalTransactions > 0 ? (double)_transactionsCompleted / _totalTransactions * 100 : 0
        };
    }
}

public class SeedingProgressStatus
{
    public int CategoriesCompleted { get; set; }
    public int TotalUsers { get; set; }
    public int TransactionsCompleted { get; set; }
    public int TotalTransactions { get; set; }
    public int BudgetsCompleted { get; set; }
    public double TransactionPercentage { get; set; }
}