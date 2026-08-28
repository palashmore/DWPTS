namespace DWPTS.Application.DTOs;

public class CalendarMonthDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal TotalWorkHours { get; set; }
    public decimal TotalMeetingHours { get; set; }
    public decimal CombinedTotalHours { get; set; }
    public int WorkingDaysCount { get; set; }
    public int HolidaysCount { get; set; }
    public int LeaveDaysCount { get; set; }
    public List<CalendarDayDto> Days { get; set; } = new();
}

public class CalendarDayDto
{
    public DateTime Date { get; set; }
    public int DayNumber => Date.Day;
    public string DayName => Date.ToString("ddd");
    public bool IsWeekend => Date.DayOfWeek == DayOfWeek.Saturday || Date.DayOfWeek == DayOfWeek.Sunday;
    public bool IsHoliday { get; set; }
    public string? HolidayName { get; set; }
    public bool IsLeave { get; set; }
    public string? LeaveType { get; set; }
    public decimal PlannedHours { get; set; }
    public decimal MeetingHours { get; set; }
    public decimal WorkHours { get; set; }
    public decimal TotalHours { get; set; }
    public decimal CapacityHours { get; set; } = 8.0m;
    public string Status { get; set; } = "NoEntry"; // Complete, UnderPlanned, OverCapacity, NoEntry, Leave, Holiday, Weekend
    public int EntriesCount { get; set; }
}

public class DashboardSummaryDto
{
    public DateTime Date { get; set; }
    public decimal CapacityHours { get; set; } = 8.0m;
    public decimal PlannedHours { get; set; }
    public decimal ActualHours { get; set; }
    public decimal MeetingHours { get; set; }
    public decimal WorkHours { get; set; }
    public decimal RemainingHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal UtilizationPercentage { get; set; }
    public decimal WeeklyActualHours { get; set; }
    public decimal MonthlyActualHours { get; set; }
    
    public List<WorkEntryDto> TodayEntries { get; set; } = new();
    public List<EffortTrendItemDto> DailyEffortTrend { get; set; } = new();
    public List<CategoryEffortItemDto> CategoryDistribution { get; set; } = new();
    public List<MeetingEffortItemDto> MeetingDistribution { get; set; } = new();
    public TeamDashboardSummaryDto? TeamSummary { get; set; }
}

public class TeamDashboardSummaryDto
{
    public int TotalMembers { get; set; }
    public decimal TotalCapacity { get; set; }
    public decimal TotalPlanned { get; set; }
    public decimal TotalActual { get; set; }
    public decimal TotalMeetings { get; set; }
    public decimal TotalOvertime { get; set; }
    public decimal AverageUtilization { get; set; }
    public List<EmployeeUtilizationDto> MemberUtilizations { get; set; } = new();
}

public class EmployeeUtilizationDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public decimal PlannedHours { get; set; }
    public decimal ActualHours { get; set; }
    public decimal MeetingHours { get; set; }
    public decimal WorkHours { get; set; }
    public decimal UtilizationPercentage { get; set; }
}

public class EffortTrendItemDto
{
    public string Label { get; set; } = string.Empty; // Date or Week or Month
    public decimal WorkHours { get; set; }
    public decimal MeetingHours { get; set; }
    public decimal TotalHours { get; set; }
    public decimal PlannedHours { get; set; }
    public decimal CapacityHours { get; set; }
}

public class CategoryEffortItemDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string? ColorCode { get; set; }
    public decimal TotalHours { get; set; }
    public decimal Percentage { get; set; }
}

public class MeetingEffortItemDto
{
    public string MeetingName { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
    public decimal Percentage { get; set; }
}

public class WeeklyReportDto
{
    public int WeekNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int WorkingDays { get; set; }
    public int Holidays { get; set; }
    public int LeaveDays { get; set; }
    public decimal PlannedHours { get; set; }
    public decimal MeetingHours { get; set; }
    public decimal WorkHours { get; set; }
    public decimal ActualHours { get; set; }
    public decimal VarianceHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal UtilizationPercentage { get; set; }
    
    public List<DailyBreakdownDto> DailyBreakdown { get; set; } = new();
    public List<CategoryEffortItemDto> CategoryBreakdown { get; set; } = new();
    public List<MeetingEffortItemDto> MeetingBreakdown { get; set; } = new();
    public List<WorkItemSummaryDto> WorkItemBreakdown { get; set; } = new();
}

public class DailyBreakdownDto
{
    public DateTime Date { get; set; }
    public string DayName { get; set; } = string.Empty;
    public decimal PlannedHours { get; set; }
    public decimal MeetingHours { get; set; }
    public decimal WorkHours { get; set; }
    public decimal ActualHours { get; set; }
    public decimal VarianceHours { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class WorkItemSummaryDto
{
    public string WorkItemNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
    public int EntriesCount { get; set; }
}

public class MonthlyReportDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public int WorkingDays { get; set; }
    public int Holidays { get; set; }
    public int LeaveDays { get; set; }
    public decimal PlannedHours { get; set; }
    public decimal MeetingHours { get; set; }
    public decimal WorkHours { get; set; }
    public decimal ActualHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal AverageHoursPerDay { get; set; }
    public decimal UtilizationPercentage { get; set; }
    public decimal VarianceHours { get; set; }
    public List<WeeklyReportDto> Weeks { get; set; } = new();
}

public class YearlyReportDto
{
    public int Year { get; set; }
    public decimal GrandTotalWorkHours { get; set; }
    public decimal GrandTotalMeetingHours { get; set; }
    public decimal GrandCombinedTotalHours { get; set; }
    public List<YearlyMonthRowDto> Months { get; set; } = new();
}

public class YearlyMonthRowDto
{
    public string MonthName { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal WorkEffortHours { get; set; }
    public decimal MeetingEffortHours { get; set; }
    public decimal CombinedTotalHours { get; set; }
    public int WorkingDays { get; set; }
    public int Holidays { get; set; }
    public int LeaveDays { get; set; }
    public decimal PlannedHours { get; set; }
    public decimal VarianceHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal UtilizationPercentage { get; set; }
    public string? Remarks { get; set; }
}

