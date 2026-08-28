using DWPTS.Application.Common;
using Microsoft.EntityFrameworkCore;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Enums;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class CalendarService : ICalendarService
{
    private readonly DWPTSDbContext _context;

    public CalendarService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<CalendarMonthDto>> GetMonthlyCalendarAsync(int year, int month, int? employeeId = null)
    {
        var firstDay = new DateTime(year, month, 1);
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var lastDay = new DateTime(year, month, daysInMonth);

        var query = _context.WorkEntries.Where(e => e.WorkDate >= firstDay && e.WorkDate <= lastDay);
        if (employeeId.HasValue && employeeId.Value > 0)
            query = query.Where(e => e.EmployeeId == employeeId.Value);

        var entries = await query.ToListAsync();
        var holidays = await _context.Holidays.Where(h => h.HolidayDate >= firstDay && h.HolidayDate <= lastDay && h.IsActive).ToListAsync();
        
        var leaveQuery = _context.EmployeeLeaves.Include(l => l.LeaveType).Where(l => l.FromDate <= lastDay && l.ToDate >= firstDay && l.Status == LeaveStatusEnum.Approved);
        if (employeeId.HasValue && employeeId.Value > 0)
            leaveQuery = leaveQuery.Where(l => l.EmployeeId == employeeId.Value);
        var leaves = await leaveQuery.ToListAsync();

        var days = new List<CalendarDayDto>();
        for (int d = 1; d <= daysInMonth; d++)
        {
            var date = new DateTime(year, month, d);
            var dayEntries = entries.Where(e => e.WorkDate.Date == date.Date).ToList();
            var holiday = holidays.FirstOrDefault(h => h.HolidayDate.Date == date.Date);
            var leave = leaves.FirstOrDefault(l => l.FromDate.Date <= date.Date && l.ToDate.Date >= date.Date);

            var planned = dayEntries.Sum(e => e.PlannedEffortHours);
            var meeting = dayEntries.Sum(e => e.MeetingEffortHours);
            var work = dayEntries.Sum(e => e.WorkEffortHours);
            var total = dayEntries.Sum(e => e.TotalEffortHours);

            var status = "NoEntry";
            if (holiday != null) status = "Holiday";
            else if (leave != null) status = "Leave";
            else if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday) status = "Weekend";
            else if (total >= 8.0m) status = total > 8.0m ? "OverCapacity" : "Complete";
            else if (total > 0 && total < 8.0m) status = "UnderPlanned";

            days.Add(new CalendarDayDto
            {
                Date = date,
                IsHoliday = holiday != null,
                HolidayName = holiday?.HolidayName,
                IsLeave = leave != null,
                LeaveType = leave?.LeaveType?.Name,
                PlannedHours = planned,
                MeetingHours = meeting,
                WorkHours = work,
                TotalHours = total,
                CapacityHours = 8.0m,
                Status = status,
                EntriesCount = dayEntries.Count
            });
        }

        var result = new CalendarMonthDto
        {
            Year = year,
            Month = month,
            MonthName = firstDay.ToString("MMMM yyyy"),
            TotalWorkHours = days.Sum(d => d.WorkHours),
            TotalMeetingHours = days.Sum(d => d.MeetingHours),
            CombinedTotalHours = days.Sum(d => d.TotalHours),
            WorkingDaysCount = days.Count(d => !d.IsWeekend && !d.IsHoliday),
            HolidaysCount = days.Count(d => d.IsHoliday),
            LeaveDaysCount = days.Count(d => d.IsLeave),
            Days = days
        };

        return ApiResponse<CalendarMonthDto>.Ok(result);
    }
}

public class HolidayService : IHolidayService
{
    private readonly DWPTSDbContext _context;

    public HolidayService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<HolidayDto>>> GetHolidaysAsync(int year)
    {
        var holidays = await _context.Holidays
            .Where(h => h.HolidayDate.Year == year && h.IsActive)
            .OrderBy(h => h.HolidayDate)
            .Select(h => new HolidayDto
            {
                HolidayId = h.HolidayId,
                HolidayDate = h.HolidayDate,
                HolidayName = h.HolidayName,
                HolidayType = h.HolidayType.ToString(),
                Description = h.Description,
                IsActive = h.IsActive
            })
            .ToListAsync();

        return ApiResponse<List<HolidayDto>>.Ok(holidays);
    }

    public async Task<ApiResponse<HolidayDto>> CreateHolidayAsync(HolidayDto request)
    {
        var h = new Holiday
        {
            HolidayDate = request.HolidayDate.Date,
            HolidayName = request.HolidayName.Trim(),
            HolidayType = Enum.TryParse<HolidayTypeEnum>(request.HolidayType, out var t) ? t : HolidayTypeEnum.PublicHoliday,
            Description = request.Description,
            IsActive = true
        };

        await _context.Holidays.AddAsync(h);
        await _context.SaveChangesAsync();

        request.HolidayId = h.HolidayId;
        return ApiResponse<HolidayDto>.Ok(request);
    }

    public async Task<ApiResponse> DeleteHolidayAsync(int id)
    {
        var h = await _context.Holidays.FindAsync(id);
        if (h == null) return ApiResponse.Fail("Holiday not found.");

        h.IsDeleted = true;
        await _context.SaveChangesAsync();
        return ApiResponse.Ok("Holiday removed.");
    }
}

public class LeaveService : ILeaveService
{
    private readonly DWPTSDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public LeaveService(DWPTSDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<List<LeaveDto>>> GetLeavesAsync(int? employeeId = null, int? year = null)
    {
        var query = _context.EmployeeLeaves
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Include(l => l.Approver)
            .AsNoTracking();

        if (employeeId.HasValue && employeeId.Value > 0)
            query = query.Where(l => l.EmployeeId == employeeId.Value);

        if (year.HasValue)
            query = query.Where(l => l.FromDate.Year == year.Value || l.ToDate.Year == year.Value);

        var leaves = await query
            .OrderByDescending(l => l.FromDate)
            .Select(l => new LeaveDto
            {
                EmployeeLeaveId = l.EmployeeLeaveId,
                EmployeeId = l.EmployeeId,
                EmployeeName = l.Employee.FullName,
                LeaveTypeId = l.LeaveTypeId,
                LeaveTypeName = l.LeaveType.Name,
                FromDate = l.FromDate,
                ToDate = l.ToDate,
                DurationDays = l.DurationDays,
                DurationHours = l.DurationHours,
                Reason = l.Reason,
                Status = l.Status.ToString(),
                ApproverName = l.Approver != null ? l.Approver.FullName : null,
                ApproverRemarks = l.ApproverRemarks
            })
            .ToListAsync();

        return ApiResponse<List<LeaveDto>>.Ok(leaves);
    }

    public async Task<ApiResponse<LeaveDto>> ApplyLeaveAsync(CreateLeaveDto request)
    {
        var empId = request.EmployeeId ?? _currentUserService.EmployeeId ?? 1;

        var leave = new EmployeeLeave
        {
            EmployeeId = empId,
            LeaveTypeId = request.LeaveTypeId,
            FromDate = request.FromDate.Date,
            ToDate = request.ToDate.Date,
            DurationDays = request.DurationDays,
            DurationHours = request.DurationDays * 8.0m,
            Reason = request.Reason,
            Status = LeaveStatusEnum.Pending
        };

        await _context.EmployeeLeaves.AddAsync(leave);
        await _context.SaveChangesAsync();

        var created = await _context.EmployeeLeaves
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .FirstAsync(l => l.EmployeeLeaveId == leave.EmployeeLeaveId);

        return ApiResponse<LeaveDto>.Ok(new LeaveDto
        {
            EmployeeLeaveId = created.EmployeeLeaveId,
            EmployeeId = created.EmployeeId,
            EmployeeName = created.Employee.FullName,
            LeaveTypeId = created.LeaveTypeId,
            LeaveTypeName = created.LeaveType.Name,
            FromDate = created.FromDate,
            ToDate = created.ToDate,
            DurationDays = created.DurationDays,
            DurationHours = created.DurationHours,
            Reason = created.Reason,
            Status = created.Status.ToString()
        });
    }

    public async Task<ApiResponse<LeaveDto>> UpdateLeaveStatusAsync(int id, UpdateLeaveStatusDto request)
    {
        var leave = await _context.EmployeeLeaves
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .FirstOrDefaultAsync(l => l.EmployeeLeaveId == id);

        if (leave == null) return ApiResponse<LeaveDto>.Fail("Leave not found.");

        if (Enum.TryParse<LeaveStatusEnum>(request.Status, true, out var status))
            leave.Status = status;

        leave.ApproverId = _currentUserService.EmployeeId;
        leave.ApproverRemarks = request.ApproverRemarks;

        await _context.SaveChangesAsync();

        return ApiResponse<LeaveDto>.Ok(new LeaveDto
        {
            EmployeeLeaveId = leave.EmployeeLeaveId,
            EmployeeId = leave.EmployeeId,
            EmployeeName = leave.Employee.FullName,
            LeaveTypeId = leave.LeaveTypeId,
            LeaveTypeName = leave.LeaveType.Name,
            FromDate = leave.FromDate,
            ToDate = leave.ToDate,
            DurationDays = leave.DurationDays,
            DurationHours = leave.DurationHours,
            Reason = leave.Reason,
            Status = leave.Status.ToString(),
            ApproverRemarks = leave.ApproverRemarks
        });
    }
}

