using Microsoft.EntityFrameworkCore;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Application.Services;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly DWPTSDbContext _context;
    private readonly IWorkEntryService _workEntryService;

    public DashboardService(DWPTSDbContext context, IWorkEntryService workEntryService)
    {
        _context = context;
        _workEntryService = workEntryService;
    }

    public async Task<ApiResponse<DashboardSummaryDto>> GetDashboardAsync(DateTime date, int? employeeId = null)
    {
        var dailyWork = await _workEntryService.GetDailyWorkAsync(date, employeeId);
        var dailyData = dailyWork.Data ?? new DailyWorkScreenDto();

        var targetDate = date.Date;
        var empId = dailyData.EmployeeId;

        // Calculate weekly total
        var dayOfWeek = (int)targetDate.DayOfWeek;
        var monday = targetDate.AddDays(dayOfWeek == 0 ? -6 : 1 - dayOfWeek);
        var sunday = monday.AddDays(6);

        var weekEntries = await _context.WorkEntries
            .Where(e => e.EmployeeId == empId && e.WorkDate >= monday && e.WorkDate <= sunday)
            .ToListAsync();

        var weeklyActual = weekEntries.Sum(e => e.TotalEffortHours);

        // Calculate monthly total
        var monthStart = new DateTime(targetDate.Year, targetDate.Month, 1);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);

        var monthEntries = await _context.WorkEntries
            .Include(e => e.Category)
            .Include(e => e.Meeting)
            .Where(e => e.EmployeeId == empId && e.WorkDate >= monthStart && e.WorkDate <= monthEnd)
            .ToListAsync();

        var monthlyActual = monthEntries.Sum(e => e.TotalEffortHours);

        // 7-day effort trend
        var trend = new List<EffortTrendItemDto>();
        for (int i = 6; i >= 0; i--)
        {
            var d = targetDate.AddDays(-i);
            var dEntries = await _context.WorkEntries.Where(e => e.EmployeeId == empId && e.WorkDate.Date == d.Date).ToListAsync();
            trend.Add(new EffortTrendItemDto
            {
                Label = d.ToString("ddd dd-MMM"),
                WorkHours = dEntries.Sum(e => e.WorkEffortHours),
                MeetingHours = dEntries.Sum(e => e.MeetingEffortHours),
                TotalHours = dEntries.Sum(e => e.TotalEffortHours),
                PlannedHours = dEntries.Sum(e => e.PlannedEffortHours),
                CapacityHours = dailyData.DailyCapacityHours
            });
        }

        // Category breakdown this month
        var categoryDist = monthEntries
            .GroupBy(e => e.Category != null ? e.Category.Name : "Other")
            .Select(g => new CategoryEffortItemDto
            {
                CategoryName = g.Key,
                ColorCode = g.FirstOrDefault()?.Category?.ColorCode ?? "#64748b",
                TotalHours = Math.Round(g.Sum(e => e.TotalEffortHours), 2),
                Percentage = monthlyActual > 0 ? Math.Round((g.Sum(e => e.TotalEffortHours) / monthlyActual) * 100, 2) : 0
            })
            .OrderByDescending(c => c.TotalHours)
            .ToList();

        // Meeting breakdown this month
        var meetingTotal = monthEntries.Sum(e => e.MeetingEffortHours);
        var meetingDist = monthEntries
            .Where(e => e.MeetingEffortHours > 0)
            .GroupBy(e => e.Meeting != null ? e.Meeting.MeetingName : (e.MeetingName ?? "Standup/General"))
            .Select(g => new MeetingEffortItemDto
            {
                MeetingName = g.Key,
                TotalHours = Math.Round(g.Sum(e => e.MeetingEffortHours), 2),
                Percentage = meetingTotal > 0 ? Math.Round((g.Sum(e => e.MeetingEffortHours) / meetingTotal) * 100, 2) : 0
            })
            .OrderByDescending(m => m.TotalHours)
            .ToList();

        // Team summary for managers
        var teamSummary = new TeamDashboardSummaryDto();
        var allEmployees = await _context.Employees.Where(e => e.IsActive).ToListAsync();
        var todayAllEntries = await _context.WorkEntries
            .Include(e => e.Employee)
            .Where(e => e.WorkDate.Date == targetDate)
            .ToListAsync();

        teamSummary.TotalMembers = allEmployees.Count;
        teamSummary.TotalCapacity = allEmployees.Sum(e => e.DailyCapacityHours);
        teamSummary.TotalPlanned = todayAllEntries.Sum(e => e.PlannedEffortHours);
        teamSummary.TotalActual = todayAllEntries.Sum(e => e.TotalEffortHours);
        teamSummary.TotalMeetings = todayAllEntries.Sum(e => e.MeetingEffortHours);
        teamSummary.TotalOvertime = todayAllEntries.Sum(e => CalculationEngine.CalculateOvertime(8.0m, e.TotalEffortHours));
        teamSummary.AverageUtilization = teamSummary.TotalCapacity > 0 ? Math.Round((teamSummary.TotalActual / teamSummary.TotalCapacity) * 100, 2) : 0;

        foreach (var emp in allEmployees)
        {
            var empEntries = todayAllEntries.Where(e => e.EmployeeId == emp.EmployeeId).ToList();
            var empActual = empEntries.Sum(e => e.TotalEffortHours);
            teamSummary.MemberUtilizations.Add(new EmployeeUtilizationDto
            {
                EmployeeId = emp.EmployeeId,
                EmployeeName = emp.FullName,
                PlannedHours = empEntries.Sum(e => e.PlannedEffortHours),
                ActualHours = empActual,
                MeetingHours = empEntries.Sum(e => e.MeetingEffortHours),
                WorkHours = empEntries.Sum(e => e.WorkEffortHours),
                UtilizationPercentage = CalculationEngine.CalculateUtilization(emp.DailyCapacityHours, empActual)
            });
        }

        var result = new DashboardSummaryDto
        {
            Date = targetDate,
            CapacityHours = dailyData.DailyCapacityHours,
            PlannedHours = dailyData.TotalPlannedHours,
            ActualHours = dailyData.TotalActualHours,
            MeetingHours = dailyData.TotalMeetingHours,
            WorkHours = dailyData.TotalWorkHours,
            RemainingHours = dailyData.RemainingCapacityHours,
            OvertimeHours = dailyData.OvertimeHours,
            UtilizationPercentage = dailyData.UtilizationPercentage,
            WeeklyActualHours = weeklyActual,
            MonthlyActualHours = monthlyActual,
            TodayEntries = dailyData.Entries,
            DailyEffortTrend = trend,
            CategoryDistribution = categoryDist,
            MeetingDistribution = meetingDist,
            TeamSummary = teamSummary
        };

        return ApiResponse<DashboardSummaryDto>.Ok(result);
    }
}
