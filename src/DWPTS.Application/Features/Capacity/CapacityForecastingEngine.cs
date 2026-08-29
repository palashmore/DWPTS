using System;
using System.Collections.Generic;
using System.Linq;
using DWPTS.Domain.ValueObjects;

namespace DWPTS.Application.Features.Capacity;

public record CapacityForecastRequest(int EmployeeId, int ForecastDays = 30, decimal HistoricalAlpha = 0.3m);

public record CapacityForecastResult(
    int EmployeeId,
    string EmployeeName,
    decimal AvailableCapacityHours,
    decimal PlannedCapacityHours,
    decimal ForecastedActualHours,
    decimal ExpectedVarianceHours,
    decimal ProjectedUtilizationPercentage,
    UtilizationStatus Status,
    bool IsOverloadProjected,
    List<DailyForecastPoint> DailyProjections
);

public record DailyForecastPoint(string Date, decimal AvailableHours, decimal ForecastedHours, decimal UtilizationPercentage);

public static class CapacityForecastingEngine
{
    /// <summary>
    /// Computes statistical capacity and exponential moving average workload forecast
    /// </summary>
    public static CapacityForecastResult CalculateForecast(
        int employeeId,
        string employeeName,
        decimal baseCapacityHoursPerDay,
        List<decimal> historicalDailyEfforts,
        int workingDaysInPeriod,
        int holidayDays,
        int leaveDays)
    {
        int effectiveWorkDays = Math.Max(0, workingDaysInPeriod - holidayDays - leaveDays);
        decimal availableCapacity = effectiveWorkDays * baseCapacityHoursPerDay;

        // Exponential smoothing forecast for expected average daily hours
        decimal avgDailyEffort = baseCapacityHoursPerDay;
        if (historicalDailyEfforts != null && historicalDailyEfforts.Count > 0)
        {
            decimal smoothed = historicalDailyEfforts[0];
            const decimal alpha = 0.35m;
            foreach (var val in historicalDailyEfforts.Skip(1))
            {
                smoothed = (alpha * val) + ((1 - alpha) * smoothed);
            }
            avgDailyEffort = smoothed;
        }

        decimal forecastedActual = Math.Round(effectiveWorkDays * avgDailyEffort, 1);
        decimal plannedHours = availableCapacity;
        decimal variance = forecastedActual - plannedHours;
        decimal utilization = availableCapacity > 0 ? Math.Round((forecastedActual / availableCapacity) * 100m, 1) : 0m;

        var status = utilization switch
        {
            < 70m => UtilizationStatus.Underutilized,
            <= 90m => UtilizationStatus.Healthy,
            <= 100m => UtilizationStatus.High,
            _ => UtilizationStatus.Overloaded
        };

        var dailyPoints = new List<DailyForecastPoint>();
        var now = DateTime.UtcNow;
        for (int i = 1; i <= Math.Min(effectiveWorkDays, 14); i++)
        {
            var dayDate = now.AddDays(i).ToString("yyyy-MM-dd");
            var pointHours = Math.Round(avgDailyEffort, 1);
            var pointUtil = baseCapacityHoursPerDay > 0 ? Math.Round((pointHours / baseCapacityHoursPerDay) * 100m, 1) : 100m;
            dailyPoints.Add(new DailyForecastPoint(dayDate, baseCapacityHoursPerDay, pointHours, pointUtil));
        }

        return new CapacityForecastResult(
            employeeId,
            employeeName,
            availableCapacity,
            plannedHours,
            forecastedActual,
            variance,
            utilization,
            status,
            utilization > 100m,
            dailyPoints
        );
    }
}
