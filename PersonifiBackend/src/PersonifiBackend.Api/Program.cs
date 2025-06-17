using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PersonifiBackend.Api.Middleware;
using PersonifiBackend.Application.BackgroundServices;
using PersonifiBackend.Application.Mapping;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Data;
using PersonifiBackend.Infrastructure.Repositories;
using Serilog;
using System.Security.Claims;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/personifi-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Add Serilog
    builder.Host.UseSerilog();

    // Add services
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // Add Authentication
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = builder.Configuration["Auth0:Domain"];
            options.Audience = builder.Configuration["Auth0:Audience"];
            options.TokenValidationParameters = new TokenValidationParameters
            {
                NameClaimType = ClaimTypes.NameIdentifier
            };
        });

    // Add Database
    builder.Services.AddDbContext<PersonifiDbContext>(options =>
    {
        options.UseNpgsql(builder.Configuration["DbConnectionString"]);
    });

    // Add AutoMapper
    builder.Services.AddAutoMapper(typeof(MappingProfile));

    // Add Repositories
    builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
    //builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
    //builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();

    // Add Services
    builder.Services.AddScoped<ITransactionService, TransactionService>();
    //builder.Services.AddScoped<ICategoryService, CategoryService>();
    //builder.Services.AddScoped<IBudgetService, BudgetService>();

    // Add Background Services
    builder.Services.AddHostedService<BudgetAlertService>();

    // Add CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowPersonifiApp", policy =>
        {
            policy.WithOrigins(builder.Configuration["Cors:AllowedOrigins"]?.Split(',') ?? new[] { "http://localhost:3000" })
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });

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
    //app.UseMiddleware<UserContextMiddleware>();

    app.MapControllers();

    // Ensure database is created and migrations are applied
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<PersonifiDbContext>();
        context.Database.Migrate();
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