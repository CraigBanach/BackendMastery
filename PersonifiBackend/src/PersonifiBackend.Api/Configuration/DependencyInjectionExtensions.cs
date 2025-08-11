using PersonifiBackend.Application.BackgroundServices;
using PersonifiBackend.Application.Mapping;
using PersonifiBackend.Application.Services;
using PersonifiBackend.Core.Interfaces;
using PersonifiBackend.Infrastructure.Repositories;
using PersonifiBackend.Infrastructure.Services;

namespace PersonifiBackend.Api.Configuration;

public static class DependencyInjectionExtensions
{
    /// <summary>
    /// Registers all application services, repositories, and background services
    /// </summary>
    public static WebApplicationBuilder AddApplicationServices(this WebApplicationBuilder builder)
    {
        // Add AutoMapper
        builder.Services.AddAutoMapper(typeof(MappingProfile));

        // Add User Context
        builder.Services.AddScoped<IUserContext, UserContext>();

        // Add Repositories
        builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
        builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
        builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();

        // Add Services
        builder.Services.AddScoped<ITransactionService, TransactionService>();
        builder.Services.AddScoped<ICategoryService, CategoryService>();
        builder.Services.AddScoped<IBudgetService, BudgetService>();

        // Add Background Services
        builder.Services.AddHostedService<BudgetAlertService>();

        return builder;
    }
}