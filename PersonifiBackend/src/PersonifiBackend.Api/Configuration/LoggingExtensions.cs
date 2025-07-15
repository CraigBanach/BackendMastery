using Serilog;

namespace PersonifiBackend.Api.Configuration;

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

    /// <summary>
    /// Adds Serilog to the web application host
    /// </summary>
    public static WebApplicationBuilder AddLogging(this WebApplicationBuilder builder)
    {
        builder.Logging.ClearProviders();
        builder.Host.UseSerilog();
        return builder;
    }
}
