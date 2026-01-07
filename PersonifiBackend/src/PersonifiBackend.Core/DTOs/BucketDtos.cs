namespace PersonifiBackend.Core.DTOs;

public record CreateBucketDto(
    string Name,
    string? Color = null,
    decimal? TargetAmount = null,
    decimal? CurrentBalance = null
);

public record UpdateBucketDto(
    string Name,
    string? Color = null,
    decimal? TargetAmount = null,
    decimal? CurrentBalance = null
);

public record BucketDto(
    int Id,
    string Name,
    string? Color,
    decimal CurrentBalance,
    decimal? TargetAmount
);
