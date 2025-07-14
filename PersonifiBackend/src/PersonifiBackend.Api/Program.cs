using PersonifiBackend.Api.Configuration;
using PersonifiBackend.Api.Extensions;
using PersonifiBackend.Infrastructure.Services;
using Serilog;

// Configure Serilog
LoggingExtensions.ConfigureLogging();

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder
    .AddLogging()
    .AddControllers()
    .AddAuthentication()
    .AddDatabase()
    .AddSwagger()
    .AddApplicationServices()
    .AddCors()
    .AddSecurity();

// Development-specific services can be added here if needed

// TODO: Configure FluentValidation in Program.cs with auto-validation

var app = builder.Build();

// Configure pipeline
app.ConfigureMiddleware();

// Ensure database is ready
app.EnsureDatabase();

try
{
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
