namespace DWPTS.Application.DTOs;

public class WorkEntryDto
{
    public int WorkEntryId { get; set; }
    public int EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public DateTime WorkDate { get; set; }
    public string DayName => WorkDate.ToString("ddd");
    public int? WorkItemId { get; set; }
    public string? WorkItemNumber { get; set; }
    public string? TaskNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryColor { get; set; }
    public int? MeetingId { get; set; }
    public string? MeetingName { get; set; }
    public decimal PlannedEffortHours { get; set; }
    public decimal MeetingEffortHours { get; set; }
    public decimal WorkEffortHours { get; set; }
    public decimal TotalEffortHours { get; set; }
    public decimal VarianceHours { get; set; }
    public string Status { get; set; } = "In Progress";
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<WorkEntryRemarkDto> RemarksHistory { get; set; } = new();
}

public class CreateWorkEntryDto
{
    public int? EmployeeId { get; set; } // If null, current logged-in employee
    public DateTime WorkDate { get; set; }
    public int? WorkItemId { get; set; }
    public string? TaskNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public int? MeetingId { get; set; }
    public string? MeetingName { get; set; }
    public decimal PlannedEffortHours { get; set; }
    public decimal MeetingEffortHours { get; set; }
    public decimal WorkEffortHours { get; set; }
    public string Status { get; set; } = "In Progress";
    public string? Remarks { get; set; }
}

public class UpdateWorkEntryDto : CreateWorkEntryDto
{
}

public class CopyWorkEntriesRequestDto
{
    public DateTime SourceDate { get; set; }
    public DateTime TargetDate { get; set; }
    public int? EmployeeId { get; set; }
    public List<int>? SelectedEntryIds { get; set; }
}

public class DailyWorkScreenDto
{
    public DateTime Date { get; set; }
    public string DayName => Date.ToString("dddd");
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal DailyCapacityHours { get; set; } = 8.0m;
    public decimal TotalPlannedHours { get; set; }
    public decimal TotalMeetingHours { get; set; }
    public decimal TotalWorkHours { get; set; }
    public decimal TotalActualHours { get; set; }
    public decimal RemainingCapacityHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal UtilizationPercentage { get; set; }
    public bool IsOverCapacity => TotalActualHours > DailyCapacityHours;
    public bool IsHoliday { get; set; }
    public string? HolidayName { get; set; }
    public bool IsLeave { get; set; }
    public string? LeaveReason { get; set; }
    public List<WorkEntryDto> Entries { get; set; } = new();
}

public class WorkEntryRemarkDto
{
    public int RemarkId { get; set; }
    public int WorkEntryId { get; set; }
    public string? Username { get; set; }
    public string RemarkText { get; set; } = string.Empty;
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AddRemarkDto
{
    public string RemarkText { get; set; } = string.Empty;
    public string? Status { get; set; }
}

public class WorkEntryFilterDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int? EmployeeId { get; set; }
    public int? CategoryId { get; set; }
    public int? MeetingId { get; set; }
    public int? WorkItemId { get; set; }
    public string? Status { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

