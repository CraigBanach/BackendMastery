using Serilog;

namespace PersonifiBackend.Tools.Configuration;

public static class LoggingExtensions
{
    /// <summary>
    /// Configures Serilog logging for the application
    /// </summary>
    public static void ConfigureLogging()
    {
        Log.Logger = new LoggerConfiguration()
            .WriteTo.Console()
            .WriteTo.File("logs/personifi-.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();
    }
}
