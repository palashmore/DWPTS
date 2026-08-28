using DWPTS.Domain.Common;
using DWPTS.Shared.Enums;

namespace DWPTS.Domain.Entities;

public class EmployeeLeave : BaseEntity
{
    public int EmployeeLeaveId { get; set; }
    public int EmployeeId { get; set; }
    public virtual Employee Employee { get; set; } = null!;
    
    public int LeaveTypeId { get; set; }
    public virtual LeaveType LeaveType { get; set; } = null!;
    
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public decimal DurationDays { get; set; } = 1.0m;
    public decimal DurationHours { get; set; } = 8.0m;
    public string? Reason { get; set; }
    public LeaveStatusEnum Status { get; set; } = LeaveStatusEnum.Pending;
    
    public int? ApproverId { get; set; }
    public virtual Employee? Approver { get; set; }
    public string? ApproverRemarks { get; set; }
}

