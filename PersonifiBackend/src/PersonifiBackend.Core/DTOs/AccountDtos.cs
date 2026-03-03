namespace PersonifiBackend.Core.DTOs;

public record AcceptInvitationResult(
    bool Success,
    string? ErrorCode = null,
    string? ErrorMessage = null,
    string? NewAccountName = null
)
{
    public static AcceptInvitationResult Succeeded(string newAccountName) =>
        new(true, NewAccountName: newAccountName);

    public static AcceptInvitationResult Failed(string errorCode, string errorMessage) =>
        new(false, errorCode, errorMessage);

    public static class ErrorCodes
    {
        public const string InvalidToken = "INVALID_TOKEN";
        public const string AlreadyMember = "ALREADY_MEMBER";
    }
}

public record InvitationDetailsDto(
    string AccountName,
    string InviterEmail,
    string? PersonalMessage,
    DateTime ExpiresAt,
    bool IsAlreadyMember
);
