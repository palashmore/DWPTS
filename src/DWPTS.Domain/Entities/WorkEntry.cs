using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class WorkEntry : BaseEntity
{
    public int WorkEntryId { get; set; }
    public int EmployeeId { get; set; }
    public virtual Employee Employee { get; set; } = null!;
    
    public DateTime WorkDate { get; set; }
    
    public int? WorkItemId { get; set; }
    public virtual WorkItem? WorkItem { get; set; }
    public string? TaskNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    
    public int? CategoryId { get; set; }
    public virtual WorkEntryCategory? Category { get; set; }
    
    public int? MeetingId { get; set; }
    public virtual Meeting? Meeting { get; set; }
    public string? MeetingName { get; set; }
    
    public decimal PlannedEffortHours { get; set; } = 0.0m;
    public decimal MeetingEffortHours { get; set; } = 0.0m;
    public decimal WorkEffortHours { get; set; } = 0.0m;
    public decimal TotalEffortHours { get; set; } = 0.0m;
    
    public string Status { get; set; } = "In Progress";
    public string? Remarks { get; set; }
    public byte[]? RowVersion { get; set; }
    
    public virtual ICollection<WorkEntryRemark> RemarksHistory { get; set; } = new List<WorkEntryRemark>();
}

