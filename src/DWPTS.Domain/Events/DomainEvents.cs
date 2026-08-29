using System;

namespace DWPTS.Domain.Events;

public interface IDomainEvent
{
    Guid EventId { get; }
    DateTime OccurredOn { get; }
}

public abstract record BaseDomainEvent : IDomainEvent
{
    public Guid EventId { get; init; } = Guid.NewGuid();
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}

public record WorkEntryCreatedEvent(int WorkEntryId, int EmployeeId, string EmployeeCode, string TaskNumber, decimal TotalHours, string WorkDate) : BaseDomainEvent;
public record WorkEntryUpdatedEvent(int WorkEntryId, int EmployeeId, decimal TotalHours, string Status) : BaseDomainEvent;
public record WorkEntryDeletedEvent(int WorkEntryId, int EmployeeId) : BaseDomainEvent;
public record CapacityThresholdExceededEvent(int EmployeeId, string EmployeeCode, string WorkDate, decimal LoggedHours, decimal CapacityHours, decimal OverloadPercentage) : BaseDomainEvent;
public record ExcelImportCompletedEvent(int ImportJobId, int TotalRows, int ImportedCount, string ImportedBy) : BaseDomainEvent;
public record EmployeeRoleChangedEvent(int EmployeeId, string EmployeeCode, string OldRole, string NewRole) : BaseDomainEvent;
