using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;

namespace PersonifiBackend.Api.Controllers;

// TODO: Add authorisation policies and roles as needed
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly ILogger<TransactionController> _logger;

    public TransactionController(
        ITransactionService transactionService,
        ILogger<TransactionController> logger)
    {
        _transactionService = transactionService;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(int id)
    {
        var userId = User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException();
        var transaction = await _transactionService.GetByIdAsync(id, userId);

        if (transaction == null)
            return NotFound();

        return Ok(transaction);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetUserTransactions(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var userId = User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException();
        var transactions = await _transactionService.GetUserTransactionsAsync(
            userId, startDate, endDate);

        return Ok(transactions);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create(
        [FromBody] CreateTransactionDto dto)
    {
        var userId = User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException();

        _logger.LogInformation(
            "Creating transaction for user {UserId}: {@Transaction}",
            userId, dto);

        var created = await _transactionService.CreateAsync(dto, userId);

        return CreatedAtAction(
            nameof(GetById),
            new { id = created.Id },
            created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> Update(
        int id,
        [FromBody] UpdateTransactionDto dto)
    {
        var userId = User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException();
        var updated = await _transactionService.UpdateAsync(id, dto, userId);

        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirst("sub")?.Value ?? throw new UnauthorizedAccessException();
        var result = await _transactionService.DeleteAsync(id, userId);

        if (!result)
            return NotFound();

        return NoContent();
    }
}