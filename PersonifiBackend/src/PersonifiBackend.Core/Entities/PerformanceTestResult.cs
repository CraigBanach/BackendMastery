namespace PersonifiBackend.Core.Entities;

public class PerformanceTestResult
{
    public string Name { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
    public long MemoryDelta { get; set; }
    public bool Success { get; set; }
    public string? Error { get; set; }
    public object? Result { get; set; }
}
