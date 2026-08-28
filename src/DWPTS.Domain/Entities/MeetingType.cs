using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class MeetingType : BaseEntity
{
    public int MeetingTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
}

