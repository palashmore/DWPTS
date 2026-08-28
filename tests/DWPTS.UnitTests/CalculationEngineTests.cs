using Xunit;
using FluentAssertions;
using DWPTS.Application.Services;

namespace DWPTS.UnitTests;

public class CalculationEngineTests
{
    [Theory]
    [InlineData(0.5, 7.5, 8.0)]
    [InlineData(1.5, 6.0, 7.5)]
    [InlineData(0.0, 4.0, 4.0)]
    [InlineData(3.0, 0.0, 3.0)]
    [InlineData(0.25, 0.75, 1.0)]
    public void CalculateTotalEffort_ShouldReturnCorrectSum(decimal meeting, decimal work, decimal expected)
    {
        var total = CalculationEngine.CalculateTotalEffort(meeting, work);
        total.Should().Be(expected);
    }

    [Theory]
    [InlineData(8.0, 8.0, 0.0)]
    [InlineData(9.0, 8.0, 1.0)]
    [InlineData(6.0, 8.0, -2.0)]
    public void CalculateVariance_ShouldReturnActualMinusPlanned(decimal actual, decimal planned, decimal expected)
    {
        var variance = CalculationEngine.CalculateVariance(actual, planned);
        variance.Should().Be(expected);
    }

    [Theory]
    [InlineData(8.0, 7.5, 0.5)]
    [InlineData(8.0, 8.0, 0.0)]
    [InlineData(8.0, 9.5, -1.5)]
    public void CalculateRemainingCapacity_ShouldReturnCapacityMinusActual(decimal capacity, decimal actual, decimal expected)
    {
        var rem = CalculationEngine.CalculateRemainingCapacity(capacity, actual);
        rem.Should().Be(expected);
    }

    [Theory]
    [InlineData(8.0, 7.5, 0.0)]
    [InlineData(8.0, 8.0, 0.0)]
    [InlineData(8.0, 9.5, 1.5)]
    [InlineData(8.0, 11.0, 3.0)]
    public void CalculateOvertime_ShouldReturnExcessAboveCapacity(decimal capacity, decimal actual, decimal expected)
    {
        var overtime = CalculationEngine.CalculateOvertime(capacity, actual);
        overtime.Should().Be(expected);
    }

    [Theory]
    [InlineData(8.0, 8.0, 100.0)]
    [InlineData(8.0, 4.0, 50.0)]
    [InlineData(8.0, 10.0, 125.0)]
    public void CalculateUtilization_ShouldReturnPercentage(decimal capacity, decimal actual, decimal expected)
    {
        var util = CalculationEngine.CalculateUtilization(capacity, actual);
        util.Should().Be(expected);
    }
}
