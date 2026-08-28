namespace DWPTS.Application.Services;

public static class CalculationEngine
{
    public static decimal CalculateTotalEffort(decimal meetingEffort, decimal workEffort)
    {
        return Math.Round(Math.Max(0, meetingEffort) + Math.Max(0, workEffort), 2);
    }

    public static decimal CalculateVariance(decimal actualEffort, decimal plannedEffort)
    {
        return Math.Round(actualEffort - plannedEffort, 2);
    }

    public static decimal CalculateRemainingCapacity(decimal capacity, decimal actualEffort)
    {
        return Math.Round(capacity - actualEffort, 2);
    }

    public static decimal CalculateOvertime(decimal capacity, decimal actualEffort)
    {
        return actualEffort > capacity ? Math.Round(actualEffort - capacity, 2) : 0.0m;
    }

    public static decimal CalculateUtilization(decimal capacity, decimal actualEffort)
    {
        if (capacity <= 0) return 0.0m;
        return Math.Round((actualEffort / capacity) * 100.0m, 2);
    }
}

