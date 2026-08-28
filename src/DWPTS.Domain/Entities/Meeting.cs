using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class Meeting : BaseEntity
{
    public int MeetingId { get; set; }
    public string MeetingName { get; set; } = string.Empty;
    public int? MeetingTypeId { get; set; }
    public virtual MeetingType? MeetingType { get; set; }
    public decimal DefaultDurationHours { get; set; } = 0.5m;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<WorkEntry> WorkEntries { get; set; } = new List<WorkEntry>();
}

