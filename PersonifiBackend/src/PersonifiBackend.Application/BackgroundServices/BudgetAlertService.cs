using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace PersonifiBackend.Application.BackgroundServices;

public class BudgetAlertService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BudgetAlertService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1);

    public BudgetAlertService(
        IServiceProvider serviceProvider,
        ILogger<BudgetAlertService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Budget Alert Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckBudgetsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking budgets");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Budget Alert Service stopped");
    }

    private async Task CheckBudgetsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        //var budgetService = scope.ServiceProvider.GetRequiredService<IBudgetService>();

        _logger.LogInformation("Checking budgets for alerts");

        // TODO: Implement budget checking logic
        // 1. Get all active budgets
        // 2. Calculate current spending for each budget period
        // 3. Check if any budgets are exceeded or near limit
        // 4. Send notifications if needed

        await Task.CompletedTask; // Replace with actual implementation
    }
}