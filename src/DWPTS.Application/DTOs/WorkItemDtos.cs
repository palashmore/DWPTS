namespace DWPTS.Application.DTOs;

public class WorkItemDto
{
    public int WorkItemId { get; set; }
    public string WorkItemNumber { get; set; } = string.Empty;
    public int? WorkItemTypeId { get; set; }
    public string? WorkItemTypeName { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ExternalReference { get; set; }
    public string Status { get; set; } = "New";
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    public decimal TotalEffortLoggedHours { get; set; }
    public int DaysWorkedCount { get; set; }
    public DateTime? FirstWorkedDate { get; set; }
    public DateTime? LastWorkedDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateWorkItemDto
{
    public string WorkItemNumber { get; set; } = string.Empty;
    public int? WorkItemTypeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ExternalReference { get; set; }
    public string Status { get; set; } = "New";
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
}

public class UpdateWorkItemDto : CreateWorkItemDto
{
}

public class WorkItemTimelineDto
{
    public int WorkItemId { get; set; }
    public string WorkItemNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal TotalEffort { get; set; }
    public List<WorkItemTimelineItemDto> Timeline { get; set; } = new();
}

public class WorkItemTimelineItemDto
{
    public DateTime WorkDate { get; set; }
    public decimal EffortHours { get; set; }
    public string? Status { get; set; }
    public string? Remarks { get; set; }
    public string? EmployeeName { get; set; }
}

