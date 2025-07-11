using PersonifiBackend.Api.Configuration;

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

// TODO: Configure FluentValidation in Program.cs with auto-validation

var app = builder.Build();

// Configure pipeline
app.ConfigureMiddleware();

// Ensure database is ready
app.EnsureDatabase();

// Run with logging
app.RunWithLogging();

public partial class Program { }
