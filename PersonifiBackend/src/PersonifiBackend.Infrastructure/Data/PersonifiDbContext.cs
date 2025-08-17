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
    public DbSet<User> Users => Set<User>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();
    public DbSet<InvitationToken> InvitationTokens => Set<InvitationToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure UTC DateTime handling for PostgreSQL
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                        v => v.Kind == DateTimeKind.Utc ? DateTime.SpecifyKind(v, DateTimeKind.Unspecified) : v,
                        v => DateTime.SpecifyKind(v, DateTimeKind.Utc)));
                }
            }
        }

        // Transaction configuration
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => new { e.AccountId, e.TransactionDate });

            // Configure DateTime columns to use timestamp without time zone
            entity.Property(e => e.TransactionDate).HasColumnType("timestamp without time zone");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp without time zone");

            entity
                .HasOne(e => e.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(e => e.Account)
                .WithMany(a => a.Transactions)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(e => e.CreatedByUser)
                .WithMany(u => u.CreatedTransactions)
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder
            .Entity<Transaction>()
            .HasIndex(t => new
            {
                t.AccountId,
                t.TransactionDate,
                t.Id,
            })
            .HasDatabaseName("IX_Transaction_AccountDate");

        // Add index for category filtering
        modelBuilder
            .Entity<Transaction>()
            .HasIndex(t => new { t.AccountId, t.CategoryId })
            .HasDatabaseName("IX_Transaction_AccountCategory");

        // Category configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.HasIndex(e => new { e.AccountId, e.Name }).IsUnique();

            entity
                .HasOne(e => e.Account)
                .WithMany(a => a.Categories)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Budget configuration
        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.HasIndex(e => new { e.AccountId, e.CategoryId, e.Year, e.Month }).IsUnique();
            entity.HasIndex(e => new { e.AccountId, e.Year, e.Month });

            // Configure DateTime columns to use timestamp without time zone
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp without time zone");

            entity
                .HasOne(e => e.Category)
                .WithMany(c => c.Budgets)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(e => e.Account)
                .WithMany(a => a.Budgets)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Auth0UserId).HasMaxLength(255);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.HasIndex(e => e.Auth0UserId).IsUnique();
            entity.HasIndex(e => e.Email);

            // Configure DateTime columns to use timestamp without time zone
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp without time zone");
        });

        // Account configuration
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100);

            // Configure DateTime columns to use timestamp without time zone
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp without time zone");
        });

        // UserAccount configuration (Many-to-Many)
        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.AccountId });

            entity.Property(e => e.JoinedAt).HasColumnType("timestamp without time zone");

            entity
                .HasOne(e => e.User)
                .WithMany(u => u.UserAccounts)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(e => e.Account)
                .WithMany(a => a.UserAccounts)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // InvitationToken configuration
        modelBuilder.Entity<InvitationToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).HasMaxLength(255);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.PersonalMessage).HasMaxLength(1000);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.ExpiresAt);

            // Configure DateTime columns to use timestamp without time zone
            entity.Property(e => e.ExpiresAt).HasColumnType("timestamp without time zone");
            entity.Property(e => e.AcceptedAt).HasColumnType("timestamp without time zone");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone");

            entity
                .HasOne(e => e.Account)
                .WithMany(a => a.InvitationTokens)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(e => e.InviterUser)
                .WithMany(u => u.SentInvitations)
                .HasForeignKey(e => e.InviterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(e => e.AcceptedByUser)
                .WithMany()
                .HasForeignKey(e => e.AcceptedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
