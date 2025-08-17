using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Exceptions;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class BudgetController : ControllerBase
{
    private readonly IBudgetService _budgetService;
    private readonly ICategoryService _categoryService;
    private readonly IUserContext _userContext;
    private readonly ILogger<BudgetController> _logger;

    public BudgetController(
        IBudgetService budgetService,
        ICategoryService categoryService,
        IUserContext userContext,
        ILogger<BudgetController> logger
    )
    {
        _budgetService = budgetService;
        _categoryService = categoryService;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Gets budget variance data for a specific month
    /// </summary>
    /// <param name="year">Year (e.g., 2024)</param>
    /// <param name="month">Month (1-12)</param>
    /// <returns>Budget variance data for all categories</returns>
    /// <response code="200">Returns budget variance data</response>
    /// <response code="400">Invalid year or month</response>
    [HttpGet("variance/{year:int}/{month:int}")]
    public async Task<ActionResult<IEnumerable<BudgetVarianceDto>>> GetBudgetVariance(
        int year,
        int month
    )
    {
        if (month < 1 || month > 12)
            return BadRequest("Month must be between 1 and 12");

        if (year < 2000 || year > 2100)
            return BadRequest("Year must be between 2000 and 2100");

        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        _logger.LogInformation(
            "Getting budget variance for account {AccountId}, year {Year}, month {Month}",
            _userContext.AccountId.Value,
            year,
            month
        );

        var variances = await _budgetService.GetBudgetVarianceAsync(
            _userContext.AccountId.Value,
            year,
            month
        );
        return Ok(variances);
    }

    /// <summary>
    /// Gets all budgets for a specific month
    /// </summary>
    /// <param name="year">Year (e.g., 2024)</param>
    /// <param name="month">Month (1-12)</param>
    /// <returns>List of budgets for the month</returns>
    /// <response code="200">Returns budgets for the month</response>
    /// <response code="400">Invalid year or month</response>
    [HttpGet("{year:int}/{month:int}")]
    public async Task<ActionResult<IEnumerable<BudgetDto>>> GetBudgetsForMonth(int year, int month)
    {
        if (month < 1 || month > 12)
            return BadRequest("Month must be between 1 and 12");

        if (year < 2000 || year > 2100)
            return BadRequest("Year must be between 2000 and 2100");

        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        _logger.LogInformation(
            "Getting budgets for account {AccountId}, year {Year}, month {Month}",
            _userContext.AccountId.Value,
            year,
            month
        );

        var budgets = await _budgetService.GetBudgetsForMonthAsync(
            _userContext.AccountId.Value,
            year,
            month
        );
        return Ok(budgets);
    }

    /// <summary>
    /// Sets/updates budgets for a specific month
    /// </summary>
    /// <param name="year">Year (e.g., 2024)</param>
    /// <param name="month">Month (1-12)</param>
    /// <param name="budgets">List of budget amounts to set</param>
    /// <returns>Updated budgets</returns>
    /// <response code="200">Budgets updated successfully</response>
    /// <response code="400">Invalid data</response>
    [HttpPut("{year:int}/{month:int}")]
    public async Task<ActionResult<IEnumerable<BudgetDto>>> SetBudgetsForMonth(
        int year,
        int month,
        [FromBody] IEnumerable<SetBudgetDto> budgets
    )
    {
        if (month < 1 || month > 12)
            return BadRequest("Month must be between 1 and 12");

        if (year < 2000 || year > 2100)
            return BadRequest("Year must be between 2000 and 2100");

        if (!budgets.Any())
            return BadRequest("At least one budget must be provided");

        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        _logger.LogInformation(
            "Setting budgets for account {AccountId}, year {Year}, month {Month}, count {Count}",
            _userContext.AccountId.Value,
            year,
            month,
            budgets.Count()
        );

        var updatedBudgets = await _budgetService.SetBudgetsForMonthAsync(
            _userContext.AccountId.Value,
            year,
            month,
            budgets
        );
        return Ok(updatedBudgets);
    }

    /// <summary>
    /// Gets a specific budget for a category and month
    /// </summary>
    /// <param name="categoryId">Category ID</param>
    /// <param name="year">Year (e.g., 2024)</param>
    /// <param name="month">Month (1-12)</param>
    /// <returns>The budget for the category and month</returns>
    /// <response code="200">Returns the budget</response>
    /// <response code="404">Budget not found</response>
    /// <response code="400">Invalid parameters</response>
    [HttpGet("category/{categoryId:int}/{year:int}/{month:int}")]
    public async Task<ActionResult<BudgetDto>> GetBudget(int categoryId, int year, int month)
    {
        if (month < 1 || month > 12)
            return BadRequest("Month must be between 1 and 12");

        if (year < 2000 || year > 2100)
            return BadRequest("Year must be between 2000 and 2100");

        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        // First validate that the category belongs to the account
        var category = await _categoryService.GetByIdAsync(categoryId, _userContext.AccountId.Value);
        if (category == null)
            return NotFound();

        var budget = await _budgetService.GetBudgetAsync(
            _userContext.AccountId.Value,
            categoryId,
            year,
            month
        );
        if (budget == null)
            return NotFound();

        return Ok(budget);
    }
}
