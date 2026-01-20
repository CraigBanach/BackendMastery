using AutoMapper;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Core.Exceptions;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Application.Services;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _budgetRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public BudgetService(
        IBudgetRepository budgetRepository,
        ITransactionRepository transactionRepository,
        ICategoryRepository categoryRepository,
        IMapper mapper
    )
    {
        _budgetRepository = budgetRepository;
        _transactionRepository = transactionRepository;
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BudgetVarianceDto>> GetBudgetVarianceAsync(
        int accountId,
        int year,
        int month
    )
    {
        var categories = await _categoryRepository.GetAccountCategoriesAsync(accountId);
        var budgets = await GetOrCreateBudgetsForMonthAsync(accountId, year, month);
        var budgetDict = budgets.ToDictionary(b => b.CategoryId, b => b.Amount);

        var variances = new List<BudgetVarianceDto>();

        foreach (var category in categories)
        {
            var budgetedAmount = budgetDict.GetValueOrDefault(category.Id, 0m);
            var actualAmount = await GetActualSpendingAsync(accountId, category.Id, year, month);

            var categoryDto = _mapper.Map<CategoryDto>(category);
            var monthlyPaceStatus = CalculateMonthlyPaceStatus(
                budgetedAmount,
                actualAmount,
                year,
                month
            );
            var expectedSpendToDate = CalculateExpectedSpendToDate(budgetedAmount, year, month);

            variances.Add(
                new BudgetVarianceDto(
                    categoryDto,
                    budgetedAmount,
                    actualAmount,
                    monthlyPaceStatus,
                    expectedSpendToDate
                )
            );
        }

        return variances;
    }

    public async Task<IEnumerable<BudgetDto>> GetBudgetsForMonthAsync(
        int accountId,
        int year,
        int month
    )
    {
        var budgets = await GetOrCreateBudgetsForMonthAsync(accountId, year, month);
        return budgets.Select(b => new BudgetDto(
            b.Id,
            _mapper.Map<CategoryDto>(b.Category),
            b.Amount,
            b.Year,
            b.Month
        ));
    }

    public async Task<IEnumerable<BudgetDto>> SetBudgetsForMonthAsync(
        int accountId,
        int year,
        int month,
        IEnumerable<SetBudgetDto> budgets
    )
    {
        // Validate that all categories belong to the account
        var categoryIds = budgets.Select(b => b.CategoryId).Distinct().ToList();
        var userCategories = await _categoryRepository.GetAccountCategoriesAsync(accountId);
        var userCategoryIds = userCategories.Select(c => c.Id).ToHashSet();

        var invalidCategoryIds = categoryIds.Where(id => !userCategoryIds.Contains(id)).ToList();
        if (invalidCategoryIds.Any())
        {
            throw new InvalidCategoriesException(invalidCategoryIds);
        }

        if (budgets.Any(b => b.Amount < 0))
        {
            throw new InvalidOperationException("Budget amounts must be zero or greater.");
        }

        var setBudgetRequests = budgets.Select(b => new SetBudgetRequest(b.CategoryId, b.Amount));
        var updatedBudgets = await _budgetRepository.SetBudgetsForMonthAsync(
            accountId,
            year,
            month,
            setBudgetRequests
        );

        return updatedBudgets.Select(b => new BudgetDto(
            b.Id,
            _mapper.Map<CategoryDto>(b.Category),
            b.Amount,
            b.Year,
            b.Month
        ));
    }

    public async Task<BudgetDto?> GetBudgetAsync(int accountId, int categoryId, int year, int month)
    {
        var budget = await _budgetRepository.GetBudgetAsync(accountId, categoryId, year, month);
        if (budget == null)
            return null;

        return new BudgetDto(
            budget.Id,
            _mapper.Map<CategoryDto>(budget.Category),
            budget.Amount,
            budget.Year,
            budget.Month
        );
    }

    private async Task<decimal> GetActualSpendingAsync(
        int accountId,
        int categoryId,
        int year,
        int month
    )
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddMilliseconds(-1);

        var transactions = await _transactionRepository.GetTransactionsByDateRangeAsync(
            accountId,
            startDate,
            endDate,
            categoryId
        );

        return transactions.Sum(t => t.Amount);
    }

    private string CalculateMonthlyPaceStatus(decimal budgeted, decimal actual, int year, int month)
    {
        if (budgeted == 0)
            return "on-track";

        var daysInMonth = DateTime.DaysInMonth(year, month);
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(year, month, 1);
        var monthEnd = new DateTime(year, month, daysInMonth);

        // If we're not in this month, compare to full month
        int daysElapsed;
        if (today < monthStart)
        {
            return "on-track"; // Future month
        }
        else if (today > monthEnd)
        {
            daysElapsed = daysInMonth; // Past month
        }
        else
        {
            daysElapsed = today.Day;
        }

        var expectedToDate = budgeted * (daysElapsed / (decimal)daysInMonth);
        var tolerance = budgeted * 0.1m; // 10% tolerance

        if (actual > expectedToDate + tolerance)
            return "ahead";
        if (actual < expectedToDate - tolerance)
            return "behind";
        return "on-track";
    }

    private decimal CalculateExpectedSpendToDate(decimal budgeted, int year, int month)
    {
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(year, month, 1);
        var monthEnd = new DateTime(year, month, daysInMonth);

        int daysElapsed;
        if (today < monthStart)
        {
            return 0; // Future month
        }
        else if (today > monthEnd)
        {
            return budgeted; // Past month
        }
        else
        {
            daysElapsed = today.Day;
        }

        return budgeted * (daysElapsed / (decimal)daysInMonth);
    }

    private async Task<IEnumerable<Budget>> GetOrCreateBudgetsForMonthAsync(
        int accountId,
        int year,
        int month
    )
    {
        var existingBudgets = await _budgetRepository.GetBudgetsForMonthAsync(
            accountId,
            year,
            month
        );

        // If budgets already exist for this month, return them
        if (existingBudgets.Any())
        {
            return existingBudgets;
        }

        // No budgets exist for this month - try to copy from previous month
        var previousMonthBudgets = await FindPreviousMonthBudgets(accountId, year, month);

        if (!previousMonthBudgets.Any())
        {
            // No previous budgets found - return empty collection
            return new List<Budget>();
        }

        // Copy budgets from previous month
        var copyForwardRequests = previousMonthBudgets.Select(b => new SetBudgetRequest(
            b.CategoryId,
            b.Amount
        ));
        return await _budgetRepository.SetBudgetsForMonthAsync(
            accountId,
            year,
            month,
            copyForwardRequests
        );
    }

    private async Task<IEnumerable<Budget>> FindPreviousMonthBudgets(
        int accountId,
        int year,
        int month
    )
    {
        // Try previous month first
        var targetDate = new DateTime(year, month, 1).AddMonths(-1);

        // Look back up to 12 months for the most recent budgets
        for (int i = 0; i < 12; i++)
        {
            var budgets = await _budgetRepository.GetBudgetsForMonthAsync(
                accountId,
                targetDate.Year,
                targetDate.Month
            );
            if (budgets.Any())
            {
                return budgets;
            }
            targetDate = targetDate.AddMonths(-1);
        }

        return new List<Budget>();
    }
}
