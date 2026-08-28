using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class WorkItemType : BaseEntity
{
    public int WorkItemTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<WorkItem> WorkItems { get; set; } = new List<WorkItem>();
}

