using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Infrastructure.Data;

public class TestDataBuilder
{
    private readonly PersonifiDbContext _context;

    public TestDataBuilder(PersonifiDbContext context)
    {
        _context = context;
    }

    public async Task<List<Transaction>> CreateTransactionsAsync(
        string userId,
        int count,
        decimal minAmount = 10,
        decimal maxAmount = 1000
    )
    {
        var random = new Random();
        var categories = await _context.Categories.Where(c => c.UserId == userId).ToListAsync();

        var transactions = new List<Transaction>();

        for (int i = 0; i < count; i++)
        {
            transactions.Add(
                new Transaction
                {
                    UserId = userId,
                    Amount = (decimal)(
                        random.NextDouble() * (double)(maxAmount - minAmount) + (double)minAmount
                    ),
                    Description = $"Test Transaction {i + 1}",
                    TransactionDate = DateTime.Now.AddDays(-random.Next(365)),
                    CategoryId = categories[random.Next(categories.Count)].Id,
                    CreatedAt = DateTime.Now,
                }
            );
        }

        await _context.Transactions.AddRangeAsync(transactions);
        await _context.SaveChangesAsync();

        return transactions;
    }
}
