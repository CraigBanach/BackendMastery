using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonifiBackend.Core.Interfaces;

namespace PersonifiBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserPreferencesController : ControllerBase
{
    private readonly IUserContext _userContext;
    private readonly ILogger<UserPreferencesController> _logger;

    public UserPreferencesController(
        IUserContext userContext,
        ILogger<UserPreferencesController> logger)
    {
        _userContext = userContext;
        _logger = logger;
    }

    [HttpPost("dismiss-invite-prompt")]
    public async Task<IActionResult> DismissInvitePrompt()
    {
        if (!_userContext.IsAuthenticated || !_userContext.UserId.HasValue)
        {
            return Unauthorized("User context not properly initialized");
        }

        try
        {
            var success = await _userContext.DismissInvitePromptAsync();
            if (!success)
            {
                _logger.LogWarning("Failed to dismiss invite prompt for user {UserId}", _userContext.UserId);
                return BadRequest("Failed to dismiss invite prompt");
            }

            _logger.LogInformation("User {UserId} dismissed invite prompt", _userContext.UserId);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error dismissing invite prompt for user {UserId}", _userContext.UserId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("invite-prompt-status")]
    public async Task<IActionResult> GetInvitePromptStatus()
    {
        if (!_userContext.IsAuthenticated || !_userContext.UserId.HasValue)
        {
            return Unauthorized("User context not properly initialized");
        }

        try
        {
            var dismissed = await _userContext.IsInvitePromptDismissedAsync();
            return Ok(new { dismissed });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting invite prompt status for user {UserId}", _userContext.UserId);
            return StatusCode(500, "Internal server error");
        }
    }
}