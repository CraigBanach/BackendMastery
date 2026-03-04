using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;

namespace PersonifiBackend.Infrastructure.Services;

public class AccountService : IAccountService
{
    private readonly PersonifiDbContext _context;
    private readonly ILogger<AccountService> _logger;

    public AccountService(PersonifiDbContext context, ILogger<AccountService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<User> GetOrCreateUserWithAccountAsync(string auth0UserId, string email)
    {
        // Fast path: Simple lookup without joins for existing users
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Auth0UserId == auth0UserId);

        if (existingUser != null)
        {
            // User exists - update email if needed
            if (!string.IsNullOrEmpty(email) && existingUser.Email != email)
            {
                existingUser.Email = email;
                existingUser.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                _logger.LogInformation(
                    "Updated email for existing user {Auth0UserId}: {Email}",
                    auth0UserId,
                    email
                );
            }

            // Fast path: User has subscription - just load it to get AccountId
            if (existingUser.SubscriptionId != null)
            {
                // Load subscription to get AccountId (single join, no Account entity needed)
                await _context.Entry(existingUser).Reference(u => u.Subscription).LoadAsync();
                return existingUser;
            }

            // Slow path: User exists but has no account - create one
            _logger.LogInformation(
                "Existing user {Auth0UserId} has no account, creating one",
                auth0UserId
            );
            await CreateAccountWithSubscriptionAsync("My Account", existingUser.Id);

            // Reload to get the subscription
            await _context.Entry(existingUser).ReloadAsync();
            await _context.Entry(existingUser).Reference(u => u.Subscription).LoadAsync();
            return existingUser;
        }

        // User doesn't exist - create user and account in a transaction
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Create the user
            var user = new User
            {
                Auth0UserId = auth0UserId,
                Email = email,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new user for Auth0 ID: {Auth0UserId}", auth0UserId);

            // Create the account with subscription and defaults
            await CreateAccountWithSubscriptionAsync("My Account", user.Id);

            await transaction.CommitAsync();

            // Reload to get the subscription
            await _context.Entry(user).ReloadAsync();
            await _context.Entry(user).Reference(u => u.Subscription).LoadAsync();

            return user;
        }
        catch (DbUpdateException ex) when (IsDuplicateKeyException(ex))
        {
            // Race condition: another request created this user simultaneously
            await transaction.RollbackAsync();

            _logger.LogInformation(
                "Race condition detected for Auth0 ID {Auth0UserId}, fetching existing user",
                auth0UserId
            );

            // Clear the change tracker to avoid issues with the rolled-back entities
            _context.ChangeTracker.Clear();

            // Re-fetch the user that was created by the other request
            // Use a retry loop in case the other transaction hasn't committed yet
            User? user = null;
            for (int i = 0; i < 5; i++)
            {
                user = await _context
                    .Users.Include(u => u.Subscription)
                    .FirstOrDefaultAsync(u => u.Auth0UserId == auth0UserId);

                if (user?.SubscriptionId != null)
                    break;

                // Wait a bit for the other transaction to complete
                await Task.Delay(100 * (i + 1));
            }

            if (user == null)
            {
                throw new InvalidOperationException(
                    $"Failed to create or retrieve user for Auth0 ID: {auth0UserId}"
                );
            }

            return user;
        }
    }

    private static bool IsDuplicateKeyException(DbUpdateException ex)
    {
        // PostgreSQL error code 23505 = unique_violation
        return ex.InnerException is Npgsql.PostgresException pgEx && pgEx.SqlState == "23505";
    }

    public async Task<User?> GetOrCreateUserAsync(string auth0UserId, string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Auth0UserId == auth0UserId);

        if (user == null)
        {
            user = new User
            {
                Auth0UserId = auth0UserId,
                Email = email,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new user for Auth0 ID: {Auth0UserId}", auth0UserId);
        }
        else if (!string.IsNullOrEmpty(email) && user.Email != email)
        {
            // Update existing user's email if it's different (fixes users who have sub claim as email)
            user.Email = email;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated email for existing user {Auth0UserId}: {Email}", auth0UserId, email);
        }

        return user;
    }

    public async Task<Account> CreateAccountAsync(string name, string? signupSource = null)
    {
        var account = new Account
        {
            Name = name,
            SignupSource = signupSource,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        return account;
    }

    public async Task<Account> CreateAccountWithSubscriptionAsync(
        string name,
        int ownerUserId,
        string? signupSource = null
    )
    {
        // Create the account
        var account = new Account
        {
            Name = name,
            SignupSource = signupSource,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync(); // Save to get ID

        // Create the subscription
        var subscription = new Subscription
        {
            OwnerUserId = ownerUserId,
            AccountId = account.Id,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Subscriptions.Add(subscription);
        await _context.SaveChangesAsync(); // Save to get ID

        // Update the account and user to link to subscription
        account.SubscriptionId = subscription.Id;

        var user = await _context.Users.FindAsync(ownerUserId);
        if (user != null)
        {
            user.SubscriptionId = subscription.Id;
            user.Role = "owner";
        }

        await _context.SaveChangesAsync();

        // Create default categories and budgets
        await CreateDefaultCategoriesAndBudgetsAsync(account.Id);

        return account;
    }

    public async Task<Account?> GetUserPrimaryAccountAsync(int userId)
    {
        // Get the user's account through their subscription
        var user = await _context
            .Users.Include(u => u.Subscription)
            .ThenInclude(s => s!.Account)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user?.Subscription?.Account;
    }

    public async Task<List<Account>> GetUserAccountsAsync(int userId)
    {
        // In the new schema, a user only has one account through their subscription
        var account = await GetUserPrimaryAccountAsync(userId);
        return account != null ? new List<Account> { account } : new List<Account>();
    }

    public async Task<bool> HasUserAccessToAccountAsync(int userId, int accountId)
    {
        var user = await _context
            .Users.Include(u => u.Subscription)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user?.Subscription?.AccountId == accountId;
    }

    public async Task<List<User>> GetAccountMembersAsync(int accountId)
    {
        // Get all users whose subscription is linked to this account
        var subscription = await _context
            .Subscriptions.Include(s => s.Users)
            .FirstOrDefaultAsync(s => s.AccountId == accountId);

        return subscription?.Users.ToList() ?? new List<User>();
    }

    public async Task AddUserToAccountAsync(int userId, int accountId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return;

        // Find the subscription for this account
        var subscription = await _context.Subscriptions.FirstOrDefaultAsync(s =>
            s.AccountId == accountId
        );

        if (subscription != null)
        {
            user.SubscriptionId = subscription.Id;
            user.Role = "member"; // New users joining are members
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemoveUserFromAccountAsync(int userId, int accountId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return;

        // Verify the user is actually on this account
        var subscription = await _context.Subscriptions.FirstOrDefaultAsync(s =>
            s.AccountId == accountId
        );

        if (subscription != null && user.SubscriptionId == subscription.Id)
        {
            user.SubscriptionId = null;
            user.Role = "owner"; // Reset to default role for when they get a new account
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Removed user {UserId} from account {AccountId}",
                userId,
                accountId
            );
        }
    }

    public async Task<InvitationToken> CreateInvitationAsync(
        int accountId,
        int inviterUserId,
        string? email,
        string? personalMessage = null
    )
    {
        var token = GenerateInvitationToken();
        var invitation = new InvitationToken
        {
            Token = token,
            Email = email,
            PersonalMessage = personalMessage,
            AccountId = accountId,
            InviterUserId = inviterUserId,
            ExpiresAt = DateTime.UtcNow.AddDays(7), // Hard-coded 7 days as requested
            CreatedAt = DateTime.UtcNow,
        };

        _context.InvitationTokens.Add(invitation);
        await _context.SaveChangesAsync();

        return invitation;
    }

    public async Task<InvitationToken?> GetValidInvitationAsync(string token)
    {
        _logger.LogInformation("Looking for invitation with token: {Token}", token);

        var currentTime = DateTime.UtcNow;
        var invitation = await _context
            .InvitationTokens.Include(i => i.Account)
            .Include(i => i.InviterUser)
            .FirstOrDefaultAsync(i =>
                i.Token == token && !i.IsAccepted && i.ExpiresAt > currentTime
            );

        _logger.LogInformation(
            "Invitation found: {Found}, Email: {Email}, IsAccepted: {IsAccepted}, ExpiresAt: {ExpiresAt}",
            invitation != null,
            invitation?.Email,
            invitation?.IsAccepted,
            invitation?.ExpiresAt
        );

        return invitation;
    }

    public async Task<AcceptInvitationResult> AcceptInvitationAsync(string token, int acceptingUserId)
    {
        var currentTime = DateTime.UtcNow;
        var invitation = await _context
            .InvitationTokens.Include(i => i.Account)
            .FirstOrDefaultAsync(i =>
                i.Token == token && !i.IsAccepted && i.ExpiresAt > currentTime
            );

        if (invitation == null)
        {
            return AcceptInvitationResult.Failed(
                AcceptInvitationResult.ErrorCodes.InvalidToken,
                "This invitation is invalid, expired, or has already been used."
            );
        }

        // Check if user is already a member of the target account
        var isAlreadyMember = await HasUserAccessToAccountAsync(acceptingUserId, invitation.AccountId);
        if (isAlreadyMember)
        {
            return AcceptInvitationResult.Failed(
                AcceptInvitationResult.ErrorCodes.AlreadyMember,
                "You are already a member of this account."
            );
        }

        // Get user's current account and handle leaving it
        var currentAccount = await GetUserPrimaryAccountAsync(acceptingUserId);
        if (currentAccount != null)
        {
            // Check if there are other members on the account
            var accountMembers = await GetAccountMembersAsync(currentAccount.Id);
            var otherMembers = accountMembers.Where(m => m.Id != acceptingUserId).ToList();

            if (otherMembers.Any())
            {
                // Other users exist - just remove this user from the account
                await RemoveUserFromAccountAsync(acceptingUserId, currentAccount.Id);
                _logger.LogInformation(
                    "Removed user {UserId} from account {AccountId} (other members remain)",
                    acceptingUserId,
                    currentAccount.Id
                );
            }
            else
            {
                // No other users - archive the account
                await ArchiveAccountAsync(currentAccount.Id);
                _logger.LogInformation(
                    "Archived account {AccountId} for user {UserId} before switching",
                    currentAccount.Id,
                    acceptingUserId
                );
            }
        }

        // Mark invitation as accepted
        invitation.IsAccepted = true;
        invitation.AcceptedAt = DateTime.UtcNow;
        invitation.AcceptedByUserId = acceptingUserId;

        // Add user to new account
        await AddUserToAccountAsync(acceptingUserId, invitation.AccountId);

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} accepted invitation {InvitationId} to account {AccountId}",
            acceptingUserId,
            invitation.Id,
            invitation.AccountId
        );

        return AcceptInvitationResult.Succeeded(invitation.Account.Name);
    }

    public async Task<InvitationDetailsDto?> GetInvitationDetailsAsync(string token, int userId)
    {
        var invitation = await GetValidInvitationAsync(token);
        if (invitation == null)
        {
            return null;
        }

        var isAlreadyMember = await HasUserAccessToAccountAsync(userId, invitation.AccountId);

        return new InvitationDetailsDto(
            AccountName: invitation.Account.Name,
            InviterEmail: invitation.InviterUser.Email,
            PersonalMessage: invitation.PersonalMessage,
            ExpiresAt: invitation.ExpiresAt,
            IsAlreadyMember: isAlreadyMember
        );
    }

    public async Task ArchiveAccountAsync(int accountId)
    {
        var account = await _context.Accounts.FindAsync(accountId);
        if (account == null)
        {
            return;
        }

        account.IsArchived = true;
        account.ArchivedAt = DateTime.UtcNow;
        account.UpdatedAt = DateTime.UtcNow;

        // Unlink the subscription from this account
        if (account.SubscriptionId.HasValue)
        {
            var subscription = await _context.Subscriptions.FindAsync(account.SubscriptionId.Value);
            if (subscription != null)
            {
                // Remove all users from this subscription
                var usersInSubscription = await _context
                    .Users.Where(u => u.SubscriptionId == subscription.Id)
                    .ToListAsync();

                foreach (var user in usersInSubscription)
                    {
                        user.SubscriptionId = null;
                        user.Role = "owner"; // They drop back to default basic role
                    
                }
            }

            account.SubscriptionId = null;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Archived account {AccountId}", accountId);
    }

    private async Task CreateDefaultCategoriesAndBudgetsAsync(int accountId)
    {
        var currentDate = DateTime.UtcNow;
        var currentYear = currentDate.Year;
        var currentMonth = currentDate.Month;

        // Define default categories with suggested budget amounts
        var defaultCategories = new[]
        {
            new
            {
                Name = "Salary",
                Type = CategoryType.Income,
                Icon = "💰",
                Color = "#22c55e",
                BudgetAmount = 4000m,
            },
            new
            {
                Name = "Food Shopping",
                Type = CategoryType.Expense,
                Icon = "🛒",
                Color = "#ef4444",
                BudgetAmount = 600m,
            },
            new
            {
                Name = "Rent/Mortgage",
                Type = CategoryType.Expense,
                Icon = "🏠",
                Color = "#3b82f6",
                BudgetAmount = 1200m,
            },
            new
            {
                Name = "Utilities",
                Type = CategoryType.Expense,
                Icon = "⚡",
                Color = "#f59e0b",
                BudgetAmount = 200m,
            },
            new
            {
                Name = "Transport",
                Type = CategoryType.Expense,
                Icon = "🚗",
                Color = "#8b5cf6",
                BudgetAmount = 300m,
            },
            new
            {
                Name = "Eating Out",
                Type = CategoryType.Expense,
                Icon = "🍽️",
                Color = "#ec4899",
                BudgetAmount = 200m,
            },
            new
            {
                Name = "Entertainment",
                Type = CategoryType.Expense,
                Icon = "🎬",
                Color = "#06b6d4",
                BudgetAmount = 150m,
            },
            new
            {
                Name = "Healthcare",
                Type = CategoryType.Expense,
                Icon = "🏥",
                Color = "#10b981",
                BudgetAmount = 100m,
            },
            new
            {
                Name = "Clothing",
                Type = CategoryType.Expense,
                Icon = "👕",
                Color = "#f97316",
                BudgetAmount = 100m,
            },
            new
            {
                Name = "Savings",
                Type = CategoryType.Expense,
                Icon = "🏦",
                Color = "#6366f1",
                BudgetAmount = 500m,
            },
        };

        // Create categories
        var categories = new List<Category>();
        foreach (var defaultCategory in defaultCategories)
        {
            var category = new Category
            {
                Name = defaultCategory.Name,
                Type = defaultCategory.Type,
                Icon = defaultCategory.Icon,
                Color = defaultCategory.Color,
                AccountId = accountId,
            };
            categories.Add(category);
            _context.Categories.Add(category);
        }

        await _context.SaveChangesAsync(); // Save to get category IDs

        // Create budgets for the current month
        var budgets = new List<Budget>();
        for (int i = 0; i < categories.Count; i++)
        {
            var budget = new Budget
            {
                AccountId = accountId,
                CategoryId = categories[i].Id,
                Amount = defaultCategories[i].BudgetAmount,
                Year = currentYear,
                Month = currentMonth,
                CreatedAt = currentDate,
            };
            budgets.Add(budget);
            _context.Budgets.Add(budget);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Created {CategoryCount} default categories and {BudgetCount} budgets for account {AccountId}",
            categories.Count,
            budgets.Count,
            accountId
        );
    }

    private static string GenerateInvitationToken()
    {
        // Generate a URL-safe token
        return Convert
            .ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
}
