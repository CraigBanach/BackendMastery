using Microsoft.EntityFrameworkCore;
using PersonifiBackend.Core.Entities;

namespace PersonifiBackend.Infrastructure.Data;

public class PersonifiDbContext : DbContext
{
    public PersonifiDbContext(DbContextOptions<PersonifiDbContext> options)
        : base(options) { }

    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Budget> Budgets => Set<Budget>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Transaction configuration
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => new { e.UserId, e.TransactionDate });

            entity
                .HasOne(e => e.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder
            .Entity<Transaction>()
            .HasIndex(t => new
            {
                t.UserId,
                t.TransactionDate,
                t.Id,
            })
            .HasDatabaseName("IX_Transaction_UserDate");

        // Add index for category filtering
        modelBuilder
            .Entity<Transaction>()
            .HasIndex(t => new { t.UserId, t.CategoryId })
            .HasDatabaseName("IX_Transaction_UserCategory");

        // Category configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.HasIndex(e => new { e.UserId, e.Name }).IsUnique();
        });

        // Budget configuration
        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.HasIndex(e => new
            {
                e.UserId,
                e.CategoryId,
                e.Period,
            });
        });

        // Seed default categories
        SeedDefaultCategories(modelBuilder);
    }

    private void SeedDefaultCategories(ModelBuilder modelBuilder)
    {
        var categories = new[]
        {
            new
            {
                Id = 1,
                Name = "Housing",
                Type = CategoryType.Expense,
                Icon = "🏠",
                Color = "#1a3a5f",
                UserId = "google-oauth2|114831037037369295773",
            },
            new
            {
                Id = 2,
                Name = "Food",
                Type = CategoryType.Expense,
                Icon = "🍔",
                Color = "#0f8a3c",
                UserId = "google-oauth2|114831037037369295773",
            },
            new
            {
                Id = 3,
                Name = "Transport",
                Type = CategoryType.Expense,
                Icon = "🚗",
                Color = "#c9a86e",
                UserId = "google-oauth2|114831037037369295773",
            },
            new
            {
                Id = 4,
                Name = "Entertainment",
                Type = CategoryType.Expense,
                Icon = "🎮",
                Color = "#8b5cf6",
                UserId = "google-oauth2|114831037037369295773",
            },
            new
            {
                Id = 5,
                Name = "Shopping",
                Type = CategoryType.Expense,
                Icon = "🛍️",
                Color = "#b54248",
                UserId = "google-oauth2|114831037037369295773",
            },
            new
            {
                Id = 6,
                Name = "Utilities",
                Type = CategoryType.Expense,
                Icon = "💡",
                Color = "#14b8a6",
                UserId = "google-oauth2|114831037037369295773",
            },
            new
            {
                Id = 7,
                Name = "Salary",
                Type = CategoryType.Income,
                Icon = "💰",
                Color = "#0f8a3c",
                UserId = "google-oauth2|114831037037369295773",
            },
            new
            {
                Id = 8,
                Name = "Freelance",
                Type = CategoryType.Income,
                Icon = "💼",
                Color = "#c9a86e",
                UserId = "google-oauth2|114831037037369295773",
            },
        };

        modelBuilder.Entity<Category>().HasData(categories);
    }
}
