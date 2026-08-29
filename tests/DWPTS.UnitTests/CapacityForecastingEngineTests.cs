using System.Collections.Generic;
using Xunit;
using DWPTS.Application.Features.Capacity;
using DWPTS.Domain.ValueObjects;

namespace DWPTS.UnitTests;

public class CapacityForecastingEngineTests
{
    [Fact]
    public void CalculateForecast_HealthyWorkload_ReturnsHealthyStatus()
    {
        // Arrange
        var history = new List<decimal> { 8.0m, 8.0m, 7.5m, 8.0m, 8.0m };

        // Act
        var result = CapacityForecastingEngine.CalculateForecast(
            employeeId: 1,
            employeeName: "John Doe",
            baseCapacityHoursPerDay: 8.0m,
            historicalDailyEfforts: history,
            workingDaysInPeriod: 20,
            holidayDays: 0,
            leaveDays: 0
        );

        // Assert
        Assert.Equal(160m, result.AvailableCapacityHours);
        Assert.True(result.ForecastedActualHours > 140m && result.ForecastedActualHours <= 165m);
        Assert.False(result.IsOverloadProjected);
        Assert.True(result.DailyProjections.Count > 0);
    }

    [Fact]
    public void CalculateForecast_OverloadEfforts_DetectsOverloadProjection()
    {
        // Arrange
        var history = new List<decimal> { 10.5m, 11.0m, 9.5m, 10.0m };

        // Act
        var result = CapacityForecastingEngine.CalculateForecast(
            employeeId: 2,
            employeeName: "Overworked Dev",
            baseCapacityHoursPerDay: 8.0m,
            historicalDailyEfforts: history,
            workingDaysInPeriod: 20,
            holidayDays: 0,
            leaveDays: 0
        );

        // Assert
        Assert.True(result.IsOverloadProjected);
        Assert.Equal(UtilizationStatus.Overloaded, result.Status);
        Assert.True(result.ProjectedUtilizationPercentage > 100m);
    }

    [Fact]
    public void CalculateForecast_WithLeavesAndHolidays_DeductsAvailableCapacityAccurately()
    {
        // Arrange
        var history = new List<decimal> { 8.0m, 8.0m };

        // Act
        var result = CapacityForecastingEngine.CalculateForecast(
            employeeId: 3,
            employeeName: "Vacation Employee",
            baseCapacityHoursPerDay: 8.0m,
            historicalDailyEfforts: history,
            workingDaysInPeriod: 20,
            holidayDays: 2,
            leaveDays: 3
        );

        // Assert
        // 20 working days - 2 holidays - 3 leaves = 15 effective work days * 8h = 120h
        Assert.Equal(120m, result.AvailableCapacityHours);
    }
}
