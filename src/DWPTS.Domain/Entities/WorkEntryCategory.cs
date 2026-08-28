using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class WorkEntryCategory : BaseEntity
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ColorCode { get; set; } = "#3b82f6";
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<WorkEntry> WorkEntries { get; set; } = new List<WorkEntry>();
}

