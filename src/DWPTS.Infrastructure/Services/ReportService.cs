using Microsoft.EntityFrameworkCore;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Application.Services;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Enums;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly DWPTSDbContext _context;
    private readonly IWorkEntryService _workEntryService;

    public ReportService(DWPTSDbContext context, IWorkEntryService workEntryService)
    {
        _context = context;
        _workEntryService = workEntryService;
    }

    public Task<ApiResponse<DailyWorkScreenDto>> GetDailyReportAsync(DateTime date, int? employeeId = null)
    {
        return _workEntryService.GetDailyWorkAsync(date, employeeId);
    }

    public async Task<ApiResponse<WeeklyReportDto>> GetWeeklyReportAsync(DateTime weekStartDate, int? employeeId = null)
    {
        var start = weekStartDate.Date;
        var end = start.AddDays(6).Date;

        var query = _context.WorkEntries
            .Include(e => e.Category)
            .Include(e => e.Meeting)
            .Include(e => e.WorkItem)
            .Where(e => e.WorkDate >= start && e.WorkDate <= end);

        if (employeeId.HasValue && employeeId.Value > 0)
            query = query.Where(e => e.EmployeeId == employeeId.Value);

        var entries = await query.ToListAsync();
        var holidays = await _context.Holidays.Where(h => h.HolidayDate >= start && h.HolidayDate <= end && h.IsActive).ToListAsync();
        var leaves = await _context.EmployeeLeaves.Where(l => l.FromDate <= end && l.ToDate >= start && l.Status == LeaveStatusEnum.Approved).ToListAsync();

        var dailyBreakdown = new List<DailyBreakdownDto>();
        for (int i = 0; i < 7; i++)
        {
            var curDate = start.AddDays(i);
            var dEntries = entries.Where(e => e.WorkDate.Date == curDate).ToList();
            var isHol = holidays.Any(h => h.HolidayDate.Date == curDate);
            var isLev = leaves.Any(l => l.FromDate.Date <= curDate && l.ToDate.Date >= curDate);

            var act = dEntries.Sum(e => e.TotalEffortHours);
            var plan = dEntries.Sum(e => e.PlannedEffortHours);

            var status = "Normal";
            if (isHol) status = "Holiday";
            else if (isLev) status = "Leave";
            else if (curDate.DayOfWeek == DayOfWeek.Saturday || curDate.DayOfWeek == DayOfWeek.Sunday) status = "Weekend";
            else if (act >= 8.0m) status = act > 8.0m ? "Over Capacity" : "Complete";
            else if (act > 0) status = "Under Planned";
            else status = "No Entry";

            dailyBreakdown.Add(new DailyBreakdownDto
            {
                Date = curDate,
                DayName = curDate.ToString("dddd"),
                PlannedHours = plan,
                MeetingHours = dEntries.Sum(e => e.MeetingEffortHours),
                WorkHours = dEntries.Sum(e => e.WorkEffortHours),
                ActualHours = act,
                VarianceHours = CalculationEngine.CalculateVariance(act, plan),
                Status = status
            });
        }

        var workHrs = entries.Sum(e => e.WorkEffortHours);
        var meetHrs = entries.Sum(e => e.MeetingEffortHours);
        var actHrs = entries.Sum(e => e.TotalEffortHours);
        var planHrs = entries.Sum(e => e.PlannedEffortHours);

        var workingDays = dailyBreakdown.Count(d => d.Status != "Weekend" && d.Status != "Holiday");
        var capacity = workingDays * 8.0m;

        // Categories
        var catBreakdown = entries.GroupBy(e => e.Category?.Name ?? "General")
            .Select(g => new CategoryEffortItemDto
            {
                CategoryName = g.Key,
                ColorCode = g.FirstOrDefault()?.Category?.ColorCode ?? "#3b82f6",
                TotalHours = Math.Round(g.Sum(e => e.TotalEffortHours), 2),
                Percentage = actHrs > 0 ? Math.Round((g.Sum(e => e.TotalEffortHours) / actHrs) * 100, 2) : 0
            }).OrderByDescending(c => c.TotalHours).ToList();

        // Meetings
        var meetBreakdown = entries.Where(e => e.MeetingEffortHours > 0)
            .GroupBy(e => e.Meeting?.MeetingName ?? e.MeetingName ?? "Meeting")
            .Select(g => new MeetingEffortItemDto
            {
                MeetingName = g.Key,
                TotalHours = Math.Round(g.Sum(e => e.MeetingEffortHours), 2),
                Percentage = meetHrs > 0 ? Math.Round((g.Sum(e => e.MeetingEffortHours) / meetHrs) * 100, 2) : 0
            }).OrderByDescending(m => m.TotalHours).ToList();

        // Work Items
        var wiBreakdown = entries.Where(e => e.WorkItemId != null || !string.IsNullOrWhiteSpace(e.TaskNumber))
            .GroupBy(e => e.WorkItem?.WorkItemNumber ?? e.TaskNumber ?? "General")
            .Select(g => new WorkItemSummaryDto
            {
                WorkItemNumber = g.Key,
                Title = g.FirstOrDefault()?.WorkItem?.Title ?? g.FirstOrDefault()?.Description ?? "Task",
                TotalHours = Math.Round(g.Sum(e => e.TotalEffortHours), 2),
                EntriesCount = g.Count()
            }).OrderByDescending(w => w.TotalHours).ToList();

        return ApiResponse<WeeklyReportDto>.Ok(new WeeklyReportDto
        {
            WeekNumber = (start.DayOfYear / 7) + 1,
            StartDate = start,
            EndDate = end,
            WorkingDays = workingDays,
            Holidays = holidays.Count,
            LeaveDays = leaves.Count,
            PlannedHours = planHrs,
            MeetingHours = meetHrs,
            WorkHours = workHrs,
            ActualHours = actHrs,
            VarianceHours = CalculationEngine.CalculateVariance(actHrs, planHrs),
            OvertimeHours = CalculationEngine.CalculateOvertime(capacity, actHrs),
            UtilizationPercentage = CalculationEngine.CalculateUtilization(capacity, actHrs),
            DailyBreakdown = dailyBreakdown,
            CategoryBreakdown = catBreakdown,
            MeetingBreakdown = meetBreakdown,
            WorkItemBreakdown = wiBreakdown
        });
    }

    public async Task<ApiResponse<MonthlyReportDto>> GetMonthlyReportAsync(int year, int month, int? employeeId = null)
    {
        var firstDay = new DateTime(year, month, 1);
        var lastDay = new DateTime(year, month, DateTime.DaysInMonth(year, month));

        var query = _context.WorkEntries.Where(e => e.WorkDate >= firstDay && e.WorkDate <= lastDay);
        if (employeeId.HasValue && employeeId.Value > 0)
            query = query.Where(e => e.EmployeeId == employeeId.Value);

        var entries = await query.ToListAsync();
        var holidays = await _context.Holidays.Where(h => h.HolidayDate >= firstDay && h.HolidayDate <= lastDay && h.IsActive).ToListAsync();
        var leaves = await _context.EmployeeLeaves.Where(l => l.FromDate <= lastDay && l.ToDate >= firstDay && l.Status == LeaveStatusEnum.Approved).ToListAsync();

        var work = entries.Sum(e => e.WorkEffortHours);
        var meet = entries.Sum(e => e.MeetingEffortHours);
        var act = entries.Sum(e => e.TotalEffortHours);
        var plan = entries.Sum(e => e.PlannedEffortHours);

        int workingDays = 0;
        for (int d = 1; d <= lastDay.Day; d++)
        {
            var cur = new DateTime(year, month, d);
            if (cur.DayOfWeek != DayOfWeek.Saturday && cur.DayOfWeek != DayOfWeek.Sunday && !holidays.Any(h => h.HolidayDate.Date == cur))
            {
                workingDays++;
            }
        }

        var capacity = workingDays * 8.0m;

        // Build weeks in month
        var weeks = new List<WeeklyReportDto>();
        var curWeekStart = firstDay;
        while (curWeekStart <= lastDay)
        {
            var res = await GetWeeklyReportAsync(curWeekStart, employeeId);
            if (res.Data != null) weeks.Add(res.Data);
            curWeekStart = curWeekStart.AddDays(7);
        }

        return ApiResponse<MonthlyReportDto>.Ok(new MonthlyReportDto
        {
            Year = year,
            Month = month,
            MonthName = firstDay.ToString("MMMM yyyy"),
            WorkingDays = workingDays,
            Holidays = holidays.Count,
            LeaveDays = leaves.Count,
            PlannedHours = plan,
            MeetingHours = meet,
            WorkHours = work,
            ActualHours = act,
            OvertimeHours = CalculationEngine.CalculateOvertime(capacity, act),
            AverageHoursPerDay = workingDays > 0 ? Math.Round(act / workingDays, 2) : 0,
            UtilizationPercentage = CalculationEngine.CalculateUtilization(capacity, act),
            VarianceHours = CalculationEngine.CalculateVariance(act, plan),
            Weeks = weeks
        });
    }

    public async Task<ApiResponse<YearlyReportDto>> GetYearlyReportAsync(int year, int? employeeId = null)
    {
        var months = new List<YearlyMonthRowDto>();
        for (int m = 1; m <= 12; m++)
        {
            var firstDay = new DateTime(year, m, 1);
            var lastDay = new DateTime(year, m, DateTime.DaysInMonth(year, m));

            var query = _context.WorkEntries.Where(e => e.WorkDate >= firstDay && e.WorkDate <= lastDay);
            if (employeeId.HasValue && employeeId.Value > 0)
                query = query.Where(e => e.EmployeeId == employeeId.Value);

            var entries = await query.ToListAsync();
            var holidays = await _context.Holidays.Where(h => h.HolidayDate >= firstDay && h.HolidayDate <= lastDay && h.IsActive).ToListAsync();
            var leaves = await _context.EmployeeLeaves.Where(l => l.FromDate <= lastDay && l.ToDate >= firstDay && l.Status == LeaveStatusEnum.Approved).ToListAsync();

            var work = entries.Sum(e => e.WorkEffortHours);
            var meet = entries.Sum(e => e.MeetingEffortHours);
            var act = entries.Sum(e => e.TotalEffortHours);
            var plan = entries.Sum(e => e.PlannedEffortHours);

            int workingDays = 0;
            for (int d = 1; d <= lastDay.Day; d++)
            {
                var cur = new DateTime(year, m, d);
                if (cur.DayOfWeek != DayOfWeek.Saturday && cur.DayOfWeek != DayOfWeek.Sunday && !holidays.Any(h => h.HolidayDate.Date == cur))
                {
                    workingDays++;
                }
            }

            var capacity = workingDays * 8.0m;

            months.Add(new YearlyMonthRowDto
            {
                MonthName = firstDay.ToString("MMMM"),
                Month = m,
                Year = year,
                WorkEffortHours = work,
                MeetingEffortHours = meet,
                CombinedTotalHours = act,
                WorkingDays = workingDays,
                Holidays = holidays.Count,
                LeaveDays = leaves.Count,
                PlannedHours = plan,
                VarianceHours = CalculationEngine.CalculateVariance(act, plan),
                OvertimeHours = CalculationEngine.CalculateOvertime(capacity, act),
                UtilizationPercentage = CalculationEngine.CalculateUtilization(capacity, act)
            });
        }

        return ApiResponse<YearlyReportDto>.Ok(new YearlyReportDto
        {
            Year = year,
            GrandTotalWorkHours = months.Sum(m => m.WorkEffortHours),
            GrandTotalMeetingHours = months.Sum(m => m.MeetingEffortHours),
            GrandCombinedTotalHours = months.Sum(m => m.CombinedTotalHours),
            Months = months
        });
    }
}
