using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Api.DTOs;
using PersonifiBackend.Core.DTOs;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionImportController : ControllerBase
{
    private readonly ITransactionImportService _transactionImportService;
    private readonly IUserContext _userContext;
    private readonly ILogger<TransactionImportController> _logger;

    public TransactionImportController(
        ITransactionImportService transactionImportService,
        IUserContext userContext,
        ILogger<TransactionImportController> logger)
    {
        _transactionImportService = transactionImportService;
        _userContext = userContext;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<TransactionImportDto>> ImportTransactions([FromForm] ImportTransactionsRequest request)
    {
        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        try
        {
            var result = await _transactionImportService.ImportTransactionsFromCsvAsync(
                request.File, 
                _userContext.AccountId.Value, 
                _userContext.UserId!.Value);
            
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing transactions for user {UserId}", _userContext.UserId);
            return StatusCode(500, "An error occurred while importing transactions");
        }
    }

    [HttpGet("pending")]
    public async Task<ActionResult<PaginationResult<PendingTransactionDto>>> GetPendingTransactions(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20)
    {
        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        var result = await _transactionImportService.GetPendingTransactionsAsync(
            _userContext.AccountId.Value, page, pageSize);
        
        return Ok(result);
    }

    [HttpGet("pending/{id}")]
    public async Task<ActionResult<PendingTransactionDto>> GetPendingTransaction(int id)
    {
        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        var result = await _transactionImportService.GetPendingTransactionByIdAsync(id, _userContext.AccountId.Value);
        
        if (result == null)
            return NotFound();
        
        return Ok(result);
    }

    [HttpPost("pending/{id}/approve")]
    public async Task<ActionResult> ApprovePendingTransaction(int id, [FromBody] ApprovePendingTransactionRequest request)
    {
        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        var success = await _transactionImportService.ApprovePendingTransactionAsync(
            id, _userContext.AccountId.Value, request);
        
        if (!success)
            return NotFound("Transaction not found or already processed");
        
        return Ok();
    }

    [HttpPost("pending/{id}/reject")]
    public async Task<ActionResult> RejectPendingTransaction(int id)
    {
        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        var success = await _transactionImportService.RejectPendingTransactionAsync(id, _userContext.AccountId.Value);
        
        if (!success)
            return NotFound("Transaction not found or already processed");
        
        return Ok();
    }

    [HttpPost("pending/bulk-approve")]
    public async Task<ActionResult<int>> BulkApproveTransactions([FromBody] BulkApproveTransactionsRequest request)
    {
        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        var count = await _transactionImportService.BulkApproveTransactionsAsync(_userContext.AccountId.Value, request);
        
        return Ok(new { ApprovedCount = count });
    }

    [HttpPost("pending/bulk-reject")]
    public async Task<ActionResult<int>> BulkRejectTransactions([FromBody] BulkRejectTransactionsRequest request)
    {
        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        var count = await _transactionImportService.BulkRejectTransactionsAsync(_userContext.AccountId.Value, request);
        
        return Ok(new { RejectedCount = count });
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<TransactionImportDto>>> GetImportHistory()
    {
        if (!_userContext.AccountId.HasValue)
            return BadRequest("Please create an account first using POST /api/account/create");

        var result = await _transactionImportService.GetImportHistoryAsync(_userContext.AccountId.Value);
        
        return Ok(result);
    }
}