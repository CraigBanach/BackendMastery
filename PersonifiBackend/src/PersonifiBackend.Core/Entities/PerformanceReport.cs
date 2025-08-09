namespace PersonifiBackend.Core.Entities;

public class PerformanceReport
{
    public Guid TestRunId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public TimeSpan TotalDuration { get; set; }
    public List<PerformanceTestResult> Tests { get; set; } = new();
}
