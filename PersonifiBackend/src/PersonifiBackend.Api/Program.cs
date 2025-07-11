using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PersonifiBackend.Api.Filters;
using PersonifiBackend.Api.Middleware;
using PersonifiBackend.Application.BackgroundServices;
using PersonifiBackend.Application.Mapping;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.Configuration;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;
using PersonifiBackend.Infrastructure.Repositories;
using PersonifiBackend.Infrastructure.Services;
using Serilog;
using System.Security.Claims;
using System.Text.Json.Serialization;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/personifi-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Services.Configure<Auth0Options>(
        builder.Configuration.GetSection(Auth0Options.SectionName)
    );
    builder.Services.Configure<CorsOptions>(
        builder.Configuration.GetSection(CorsOptions.SectionName)
    );

    // Add Serilog
    builder.Host.UseSerilog();

    // Add services
    builder
        .Services.AddControllers(options =>
        {
            options.Filters.Add<RequireAuthenticatedUserAttribute>();
        })
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // Add Authentication
    builder
        .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            var auth0Options =
                builder.Configuration.GetSection(Auth0Options.SectionName).Get<Auth0Options>()
                ?? throw new InvalidOperationException(
                    "Auth0 configuration is missing or invalid."
                );

            options.Authority =
                auth0Options.Domain
                ?? throw new InvalidOperationException("Auth0 Domain is not configured.");
            options.Audience =
                auth0Options.Audience
                ?? throw new InvalidOperationException("Auth0 Audience is not configured.");
            options.TokenValidationParameters = new TokenValidationParameters
            {
                NameClaimType = ClaimTypes.NameIdentifier,
            };
        });

    // Add Database
    if (!builder.Environment.IsEnvironment("Testing"))
    {
        builder.Services.AddDbContext<PersonifiDbContext>(options =>
        {
            var dbConnectionString =
                builder
                    .Configuration.GetSection(DatabaseOptions.SectionName)
                    .Get<DatabaseOptions>()
                    ?.ConnectionString
                ?? throw new InvalidOperationException(
                    "Database connection string is not configured."
                );

            options.UseNpgsql(dbConnectionString);
        });
    }

    // Add AutoMapper
    builder.Services.AddAutoMapper(typeof(MappingProfile));

    builder.Services.AddScoped<IUserContext, UserContext>();

    // Add Repositories
    builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
    builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
    //builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();

    // Add Services
    builder.Services.AddScoped<ITransactionService, TransactionService>();
    builder.Services.AddScoped<ICategoryService, CategoryService>();
    //builder.Services.AddScoped<IBudgetService, BudgetService>();

    // Add Background Services
    builder.Services.AddHostedService<BudgetAlertService>();

    // Add CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(
            "AllowPersonifiApp",
            policy =>
            {
                var corsOptions =
                    builder.Configuration.GetSection(CorsOptions.SectionName).Get<CorsOptions>()
                    ?? throw new InvalidOperationException(
                        "CORS configuration is missing or invalid."
                    );

                policy
                    .WithOrigins(corsOptions.AllowedOrigins ?? new[] { "http://localhost:3000" })
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            }
        );
    });

    builder.Services.AddHealthChecks().AddDbContextCheck<PersonifiDbContext>();

    var app = builder.Build();

    // Configure the HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseCors("AllowPersonifiApp");

    app.UseAuthentication();
    app.UseAuthorization();

    app.UseMiddleware<ErrorHandlingMiddleware>();
    app.UseMiddleware<UserContextMiddleware>();

    app.MapControllers();
    app.MapHealthChecks("/healthz");

    // Ensure database is created and migrations are applied
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();
        if (context.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
        {
            context.Database.Migrate();
        }
    }

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
