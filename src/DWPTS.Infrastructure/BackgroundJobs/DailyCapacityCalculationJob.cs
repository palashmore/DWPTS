using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using DWPTS.Application.Interfaces;

namespace DWPTS.Infrastructure.BackgroundJobs;

public class DailyCapacityCalculationJob : BackgroundService
{
    private readonly ILogger<DailyCapacityCalculationJob> _logger;

    public DailyCapacityCalculationJob(ILogger<DailyCapacityCalculationJob> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DailyCapacityCalculationJob background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("[Background Job] Executing scheduled daily capacity & utilization recalculation at: {Time}", DateTimeOffset.Now);
                // Background capacity calculation and aggregate health check
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in DailyCapacityCalculationJob");
            }

            // Run hourly
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
