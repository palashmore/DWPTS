using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class LeaveType : BaseEntity
{
    public int LeaveTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPaid { get; set; } = true;
    public bool IsActive { get; set; } = true;
    
    public virtual ICollection<EmployeeLeave> Leaves { get; set; } = new List<EmployeeLeave>();
}

