using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Core.Entities;
using PersonifiBackend.Infrastructure.Services;

namespace PersonifiBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly IUserContext _userContext;
    private readonly ILogger<AccountController> _logger;

    public AccountController(
        IAccountService accountService, 
        IUserContext userContext, 
        ILogger<AccountController> logger)
    {
        _accountService = accountService;
        _userContext = userContext;
        _logger = logger;
    }

    [HttpPost("invite")]
    public async Task<IActionResult> SendInvitation([FromBody] SendInvitationRequest request)
    {
        if (!_userContext.UserId.HasValue || !_userContext.AccountId.HasValue)
        {
            return Unauthorized("User context not properly initialized");
        }

        try
        {
            var invitation = await _accountService.CreateInvitationAsync(
                _userContext.AccountId.Value,
                _userContext.UserId.Value,
                request.Email,
                request.PersonalMessage);

            return Ok(new SendInvitationResponse
            {
                InvitationId = invitation.Id,
                Token = invitation.Token,
                InvitationUrl = $"{Request.Scheme}://{Request.Host}/invite/{invitation.Token}",
                ExpiresAt = invitation.ExpiresAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating invitation for email {Email}", request.Email);
            return BadRequest("Failed to create invitation");
        }
    }

    [HttpPost("generate-invite-token")]
    public async Task<IActionResult> GenerateInviteToken()
    {
        if (!_userContext.UserId.HasValue || !_userContext.AccountId.HasValue)
        {
            return Unauthorized("User context not properly initialized");
        }

        try
        {
            var invitation = await _accountService.CreateInvitationAsync(
                _userContext.AccountId.Value,
                _userContext.UserId.Value,
                null, // No email required
                null); // No personal message

            return Ok(new GenerateTokenResponse
            {
                Token = invitation.Token,
                ExpiresAt = invitation.ExpiresAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating invite token for user {UserId}", _userContext.UserId);
            return BadRequest("Failed to generate invite token");
        }
    }

    [HttpGet("invitation/{token}")]
    public async Task<IActionResult> GetInvitation(string token)
    {
        try
        {
            var invitation = await _accountService.GetValidInvitationAsync(token);
            
            if (invitation == null)
            {
                return NotFound("Invitation not found or expired");
            }

            return Ok(new InvitationDetailsResponse
            {
                AccountName = invitation.Account.Name,
                InviterEmail = invitation.InviterUser.Email,
                PersonalMessage = invitation.PersonalMessage,
                ExpiresAt = invitation.ExpiresAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving invitation {Token}", token);
            return BadRequest("Failed to retrieve invitation");
        }
    }

    [HttpPost("invitation/{token}/accept")]
    public async Task<IActionResult> AcceptInvitation(string token)
    {
        if (!_userContext.UserId.HasValue)
        {
            return Unauthorized("User context not properly initialized");
        }

        try
        {
            var success = await _accountService.AcceptInvitationAsync(token, _userContext.UserId.Value);
            
            if (!success)
            {
                return BadRequest("Invalid or expired invitation");
            }

            return Ok(new AcceptInvitationResponse
            {
                Success = true,
                Message = "Successfully joined account"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accepting invitation {Token} for user {UserId}", token, _userContext.UserId);
            return BadRequest("Failed to accept invitation");
        }
    }

    [HttpGet("members")]
    public async Task<IActionResult> GetAccountMembers()
    {
        if (!_userContext.AccountId.HasValue)
        {
            return Unauthorized("No active account");
        }

        try
        {
            var members = await _accountService.GetAccountMembersAsync(_userContext.AccountId.Value);
            
            var memberResponses = members.Select(m => new AccountMemberResponse
            {
                UserId = m.Id,
                Email = m.Email,
                Role = m.Role,
                JoinedAt = m.CreatedAt // Using CreatedAt as a proxy for joined date in new schema
            }).ToList();

            return Ok(memberResponses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving account members for account {AccountId}", _userContext.AccountId);
            return BadRequest("Failed to retrieve account members");
        }
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
    {
        if (!_userContext.UserId.HasValue)
        {
            return Unauthorized("User context not properly initialized");
        }

        try
        {
            // Use the new method that creates account with subscription in one go
            var account = await _accountService.CreateAccountWithSubscriptionAsync(request.Name, _userContext.UserId.Value);

            // Refresh user context to include the new account
            if (_userContext is UserContext userContextImpl)
            {
                var primaryAccount = await _accountService.GetUserPrimaryAccountAsync(_userContext.UserId.Value);
                if (primaryAccount != null)
                {
                    userContextImpl.AccountId = primaryAccount.Id;
                    _logger.LogDebug("Updated user context with new AccountId: {AccountId}", primaryAccount.Id);
                }
            }

            return Ok(new CreateAccountResponse
            {
                AccountId = account.Id,
                Name = account.Name,
                CreatedAt = account.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating account {AccountName} for user {UserId}", request.Name, _userContext.UserId);
            return BadRequest("Failed to create account");
        }
    }

    [HttpGet("has-account")]
    public async Task<ActionResult<bool>> HasAccount()
    {
        if (!_userContext.UserId.HasValue)
        {
            return Unauthorized("User context not properly initialized");
        }

        try
        {
            var account = await _accountService.GetUserPrimaryAccountAsync(_userContext.UserId.Value);
            return Ok(account != null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} has account", _userContext.UserId);
            return Ok(false); // Return false on error to avoid redirect loops
        }
    }
}

// DTOs for API requests and responses
public class SendInvitationRequest
{
    public string Email { get; set; } = string.Empty;
    public string? PersonalMessage { get; set; }
}

public class SendInvitationResponse
{
    public int InvitationId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string InvitationUrl { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class InvitationDetailsResponse
{
    public string AccountName { get; set; } = string.Empty;
    public string InviterEmail { get; set; } = string.Empty;
    public string? PersonalMessage { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class AcceptInvitationResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class AccountMemberResponse
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}

public class CreateAccountRequest
{
    public string Name { get; set; } = string.Empty;
}

public class CreateAccountResponse
{
    public int AccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class GenerateTokenResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}