using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Controllers;

/// <summary>
/// Transaction management endpoints for authenticated users
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly IUserContext _userContext;
    private readonly ILogger<TransactionController> _logger;

    public TransactionController(
        ITransactionService transactionService,
        IUserContext userContext,
        ILogger<TransactionController> logger
    )
    {
        _transactionService = transactionService;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Gets a specific transaction by ID for the authenticated user
    /// </summary>
    /// <param name="id">The transaction ID</param>
    /// <returns>The transaction details</returns>
    /// <response code="200">Returns the transaction</response>
    /// <response code="404">Transaction not found</response>
    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(int id)
    {
        var transaction = await _transactionService.GetByIdAsync(id, _userContext.UserId);

        if (transaction == null)
            return NotFound();

        return Ok(transaction);
    }

    /// <summary>
    /// Gets paginated transactions for the authenticated user with optional filtering
    /// </summary>
    /// <param name="pagination">Pagination parameters (page, pageSize, sortBy, sortDescending)</param>
    /// <param name="startDate">Filter transactions from this date (inclusive)</param>
    /// <param name="endDate">Filter transactions to this date (inclusive)</param>
    /// <param name="categoryId">Filter by category ID</param>
    /// <returns>Paginated list of transactions</returns>
    /// <response code="200">Returns paginated transactions with headers</response>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<TransactionDto>>> GetUserTransactions(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int? categoryId
    )
    {
        var transactions = await _transactionService.GetUserTransactionsAsync(
            _userContext.UserId,
            pagination,
            startDate,
            endDate,
            categoryId
        );

        // Add pagination headers for client convenience
        Response.Headers.Append("X-Current-Page", transactions.CurrentPage.ToString());
        Response.Headers.Append("X-Page-Size", transactions.PageSize.ToString());
        Response.Headers.Append("X-Total-Count", transactions.TotalCount.ToString());
        Response.Headers.Append("X-Total-Pages", transactions.TotalPages.ToString());

        return Ok(transactions);
    }

    /// <summary>
    /// Creates a new transaction for the authenticated user
    /// </summary>
    /// <param name="dto">Transaction details</param>
    /// <returns>The created transaction with assigned ID</returns>
    /// <response code="201">Transaction created successfully</response>
    /// <response code="400">Invalid transaction data</response>
    // TODO: Rename dto for better API clarity throughout controllers
    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionDto dto)
    {
        _logger.LogInformation(
            "Creating transaction for user {UserId}: {@Transaction}",
            _userContext.UserId,
            dto
        );

        var created = await _transactionService.CreateAsync(dto, _userContext.UserId);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates an existing transaction for the authenticated user
    /// </summary>
    /// <param name="id">The transaction ID to update</param>
    /// <param name="dto">Updated transaction details</param>
    /// <returns>The updated transaction</returns>
    /// <response code="200">Transaction updated successfully</response>
    /// <response code="404">Transaction not found</response>
    /// <response code="400">Invalid transaction data</response>
    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> Update(
        int id,
        [FromBody] UpdateTransactionDto dto
    )
    {
        var updated = await _transactionService.UpdateAsync(id, dto, _userContext.UserId);

        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    // TODO: Add patch endpoint to update only a small part of the transaction

    /// <summary>
    /// Deletes a transaction for the authenticated user
    /// </summary>
    /// <param name="id">The transaction ID to delete</param>
    /// <returns>No content on success</returns>
    /// <response code="204">Transaction deleted successfully</response>
    /// <response code="404">Transaction not found</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _transactionService.DeleteAsync(id, _userContext.UserId);

        if (!result)
            return NotFound();

        return NoContent();
    }
}
