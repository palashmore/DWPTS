using System;

namespace DWPTS.Domain.ValueObjects;

public enum UtilizationStatus
{
    Underutilized, // 0 - 70%
    Healthy,       // 70 - 90%
    High,          // 90 - 100%
    Overloaded     // > 100%
}

public enum SystemRole
{
    EMPLOYEE,
    MANAGER,
    ADMIN
}

public record TaskIdentifier
{
    public string TaskNumber { get; init; }
    public string Title { get; init; }

    public TaskIdentifier(string taskNumber, string title)
    {
        TaskNumber = string.IsNullOrWhiteSpace(taskNumber) ? "TASK-GEN" : taskNumber.Trim().ToUpper();
        Title = string.IsNullOrWhiteSpace(title) ? "General Work" : title.Trim();
    }
}
