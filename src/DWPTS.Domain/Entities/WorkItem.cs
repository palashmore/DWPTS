using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class WorkItem : BaseEntity
{
    public int WorkItemId { get; set; }
    public string WorkItemNumber { get; set; } = string.Empty;
    public int? WorkItemTypeId { get; set; }
    public virtual WorkItemType? WorkItemType { get; set; }
    
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ExternalReference { get; set; }
    public string Status { get; set; } = "New";
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    
    public virtual ICollection<WorkEntry> WorkEntries { get; set; } = new List<WorkEntry>();
    public virtual ICollection<WorkItemHistory> History { get; set; } = new List<WorkItemHistory>();
}

