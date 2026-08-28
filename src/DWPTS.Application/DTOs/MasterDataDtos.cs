namespace DWPTS.Application.DTOs;

public class CategoryDto
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ColorCode { get; set; }
    public bool IsActive { get; set; }
    public int TotalEntriesCount { get; set; }
    public decimal TotalEffortHours { get; set; }
}

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ColorCode { get; set; } = "#3b82f6";
}

public class MeetingDto
{
    public int MeetingId { get; set; }
    public string MeetingName { get; set; } = string.Empty;
    public int? MeetingTypeId { get; set; }
    public string? MeetingTypeName { get; set; }
    public decimal DefaultDurationHours { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public class MeetingAnalysisDto
{
    public int MeetingId { get; set; }
    public string MeetingName { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
    public int OccurrencesCount { get; set; }
    public decimal AverageDurationHours { get; set; }
    public decimal PercentageOfTotalEffort { get; set; }
}

public class HolidayDto
{
    public int HolidayId { get; set; }
    public DateTime HolidayDate { get; set; }
    public string HolidayName { get; set; } = string.Empty;
    public string HolidayType { get; set; } = "PublicHoliday";
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public class LeaveDto
{
    public int EmployeeLeaveId { get; set; }
    public int EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public int LeaveTypeId { get; set; }
    public string? LeaveTypeName { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public decimal DurationDays { get; set; }
    public decimal DurationHours { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = "Pending";
    public string? ApproverName { get; set; }
    public string? ApproverRemarks { get; set; }
}

public class CreateLeaveDto
{
    public int? EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public decimal DurationDays { get; set; } = 1.0m;
    public string? Reason { get; set; }
}

public class UpdateLeaveStatusDto
{
    public string Status { get; set; } = "Approved"; // Approved, Rejected, Cancelled
    public string? ApproverRemarks { get; set; }
}

