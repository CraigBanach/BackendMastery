using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Controllers;

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

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(int id)
    {
        var transaction = await _transactionService.GetByIdAsync(id, _userContext.UserId);

        if (transaction == null)
            return NotFound();

        return Ok(transaction);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetUserTransactions(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate
    )
    {
        var transactions = await _transactionService.GetUserTransactionsAsync(
            _userContext.UserId,
            startDate,
            endDate
        );

        return Ok(transactions);
    }

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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _transactionService.DeleteAsync(id, _userContext.UserId);

        if (!result)
            return NotFound();

        return NoContent();
    }
}
