using Microsoft.EntityFrameworkCore;
using DWPTS.Application.Common;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Application.Services;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class WorkEntryService : IWorkEntryService
{
    private readonly DWPTSDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public WorkEntryService(DWPTSDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    private async Task<int> ResolveEmployeeIdAsync(int? employeeId)
    {
        if (employeeId.HasValue && employeeId.Value > 0)
        {
            var emp = await _context.Employees.FindAsync(employeeId.Value);
            if (emp != null) return emp.EmployeeId;
        }
        if (_currentUserService.EmployeeId.HasValue)
        {
            var emp = await _context.Employees.FindAsync(_currentUserService.EmployeeId.Value);
            if (emp != null) return emp.EmployeeId;
        }

        var firstEmp = await _context.Employees.FirstOrDefaultAsync();
        return firstEmp?.EmployeeId ?? 1;
    }

    public async Task<ApiResponse<DailyWorkScreenDto>> GetDailyWorkAsync(DateTime date, int? employeeId = null)
    {
        var empId = await ResolveEmployeeIdAsync(employeeId);
        var targetDate = date.Date;

        var employee = await _context.Employees.FindAsync(empId) ?? await _context.Employees.FirstOrDefaultAsync();
        if (employee == null)
        {
            employee = new Employee
            {
                EmployeeCode = "EMP001",
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@company.com",
                DailyCapacityHours = 8.0m,
                IsActive = true
            };
            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
        }
        empId = employee.EmployeeId;

        var entries = await _context.WorkEntries
            .Include(e => e.Employee)
            .Include(e => e.Category)
            .Include(e => e.Meeting)
            .Include(e => e.WorkItem)
            .Include(e => e.RemarksHistory)
                .ThenInclude(r => r.User)
            .Where(e => !e.IsDeleted && e.WorkDate.Date == targetDate)
            .OrderBy(e => e.WorkEntryId)
            .Select(e => new WorkEntryDto
            {
                WorkEntryId = e.WorkEntryId,
                EmployeeId = e.EmployeeId,
                EmployeeName = e.Employee.FullName,
                WorkDate = e.WorkDate,
                WorkItemId = e.WorkItemId,
                WorkItemNumber = e.WorkItem != null ? e.WorkItem.WorkItemNumber : e.TaskNumber,
                TaskNumber = e.TaskNumber,
                Description = e.Description,
                CategoryId = e.CategoryId,
                CategoryName = e.Category != null ? e.Category.Name : null,
                CategoryColor = e.Category != null ? e.Category.ColorCode : null,
                MeetingId = e.MeetingId,
                MeetingName = e.Meeting != null ? e.Meeting.MeetingName : e.MeetingName,
                PlannedEffortHours = e.PlannedEffortHours,
                MeetingEffortHours = e.MeetingEffortHours,
                WorkEffortHours = e.WorkEffortHours,
                TotalEffortHours = e.TotalEffortHours,
                VarianceHours = CalculationEngine.CalculateVariance(e.TotalEffortHours, e.PlannedEffortHours),
                Status = e.Status,
                Remarks = e.Remarks,
                CreatedAt = e.CreatedAt,
                RemarksHistory = e.RemarksHistory.OrderByDescending(r => r.CreatedAt).Select(r => new WorkEntryRemarkDto
                {
                    RemarkId = r.RemarkId,
                    WorkEntryId = r.WorkEntryId,
                    Username = r.User != null ? r.User.Username : "User",
                    RemarkText = r.RemarkText,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt
                }).ToList()
            })
            .ToListAsync();

        var holiday = await _context.Holidays.FirstOrDefaultAsync(h => h.HolidayDate.Date == targetDate && h.IsActive);
        var leave = await _context.EmployeeLeaves
            .Include(l => l.LeaveType)
            .FirstOrDefaultAsync(l => l.EmployeeId == empId && l.FromDate.Date <= targetDate && l.ToDate.Date >= targetDate && l.Status == Shared.Enums.LeaveStatusEnum.Approved);

        var capacity = employee.DailyCapacityHours;
        var planned = entries.Sum(e => e.PlannedEffortHours);
        var meeting = entries.Sum(e => e.MeetingEffortHours);
        var work = entries.Sum(e => e.WorkEffortHours);
        var actual = entries.Sum(e => e.TotalEffortHours);

        var dto = new DailyWorkScreenDto
        {
            Date = targetDate,
            EmployeeId = empId,
            EmployeeName = employee.FullName,
            DailyCapacityHours = capacity,
            TotalPlannedHours = planned,
            TotalMeetingHours = meeting,
            TotalWorkHours = work,
            TotalActualHours = actual,
            RemainingCapacityHours = CalculationEngine.CalculateRemainingCapacity(capacity, actual),
            OvertimeHours = CalculationEngine.CalculateOvertime(capacity, actual),
            UtilizationPercentage = CalculationEngine.CalculateUtilization(capacity, actual),
            IsHoliday = holiday != null,
            HolidayName = holiday?.HolidayName,
            IsLeave = leave != null,
            LeaveReason = leave != null ? $"{leave.LeaveType?.Name}: {leave.Reason}" : null,
            Entries = entries
        };

        return ApiResponse<DailyWorkScreenDto>.Ok(dto);
    }

    public async Task<ApiResponse<PagedResult<WorkEntryDto>>> GetWorkEntriesAsync(WorkEntryFilterDto filter)
    {
        var query = _context.WorkEntries
            .Include(e => e.Employee)
            .Include(e => e.Category)
            .Include(e => e.Meeting)
            .Include(e => e.WorkItem)
            .AsNoTracking();

        if (filter.EmployeeId.HasValue && filter.EmployeeId.Value > 0)
            query = query.Where(e => e.EmployeeId == filter.EmployeeId.Value);

        if (filter.FromDate.HasValue)
            query = query.Where(e => e.WorkDate.Date >= filter.FromDate.Value.Date);

        if (filter.ToDate.HasValue)
            query = query.Where(e => e.WorkDate.Date <= filter.ToDate.Value.Date);

        if (filter.CategoryId.HasValue)
            query = query.Where(e => e.CategoryId == filter.CategoryId.Value);

        if (filter.MeetingId.HasValue)
            query = query.Where(e => e.MeetingId == filter.MeetingId.Value);

        if (filter.WorkItemId.HasValue)
            query = query.Where(e => e.WorkItemId == filter.WorkItemId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Status))
            query = query.Where(e => e.Status == filter.Status);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.ToLower();
            query = query.Where(e => e.Description.ToLower().Contains(search) 
                                  || (e.TaskNumber != null && e.TaskNumber.ToLower().Contains(search))
                                  || (e.Remarks != null && e.Remarks.ToLower().Contains(search))
                                  || (e.MeetingName != null && e.MeetingName.ToLower().Contains(search)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(e => e.WorkDate)
            .ThenByDescending(e => e.WorkEntryId)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(e => new WorkEntryDto
            {
                WorkEntryId = e.WorkEntryId,
                EmployeeId = e.EmployeeId,
                EmployeeName = e.Employee.FullName,
                WorkDate = e.WorkDate,
                WorkItemId = e.WorkItemId,
                WorkItemNumber = e.WorkItem != null ? e.WorkItem.WorkItemNumber : e.TaskNumber,
                TaskNumber = e.TaskNumber,
                Description = e.Description,
                CategoryId = e.CategoryId,
                CategoryName = e.Category != null ? e.Category.Name : null,
                CategoryColor = e.Category != null ? e.Category.ColorCode : null,
                MeetingId = e.MeetingId,
                MeetingName = e.Meeting != null ? e.Meeting.MeetingName : e.MeetingName,
                PlannedEffortHours = e.PlannedEffortHours,
                MeetingEffortHours = e.MeetingEffortHours,
                WorkEffortHours = e.WorkEffortHours,
                TotalEffortHours = e.TotalEffortHours,
                VarianceHours = CalculationEngine.CalculateVariance(e.TotalEffortHours, e.PlannedEffortHours),
                Status = e.Status,
                Remarks = e.Remarks,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<WorkEntryDto>>.Ok(new PagedResult<WorkEntryDto>
        {
            Items = items,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalCount = total
        });
    }

    public async Task<ApiResponse<WorkEntryDto>> GetWorkEntryByIdAsync(int id)
    {
        var e = await _context.WorkEntries
            .Include(e => e.Employee)
            .Include(e => e.Category)
            .Include(e => e.Meeting)
            .Include(e => e.WorkItem)
            .Include(e => e.RemarksHistory)
            .FirstOrDefaultAsync(e => e.WorkEntryId == id);

        if (e == null) return ApiResponse<WorkEntryDto>.Fail("Work entry not found.");

        return ApiResponse<WorkEntryDto>.Ok(new WorkEntryDto
        {
            WorkEntryId = e.WorkEntryId,
            EmployeeId = e.EmployeeId,
            EmployeeName = e.Employee.FullName,
            WorkDate = e.WorkDate,
            WorkItemId = e.WorkItemId,
            WorkItemNumber = e.WorkItem != null ? e.WorkItem.WorkItemNumber : e.TaskNumber,
            TaskNumber = e.TaskNumber,
            Description = e.Description,
            CategoryId = e.CategoryId,
            CategoryName = e.Category?.Name,
            CategoryColor = e.Category?.ColorCode,
            MeetingId = e.MeetingId,
            MeetingName = e.Meeting != null ? e.Meeting.MeetingName : e.MeetingName,
            PlannedEffortHours = e.PlannedEffortHours,
            MeetingEffortHours = e.MeetingEffortHours,
            WorkEffortHours = e.WorkEffortHours,
            TotalEffortHours = e.TotalEffortHours,
            VarianceHours = CalculationEngine.CalculateVariance(e.TotalEffortHours, e.PlannedEffortHours),
            Status = e.Status,
            Remarks = e.Remarks,
            CreatedAt = e.CreatedAt
        });
    }

    public async Task<ApiResponse<WorkEntryDto>> CreateWorkEntryAsync(CreateWorkEntryDto request)
    {
        var empId = await ResolveEmployeeIdAsync(request.EmployeeId);
        var total = CalculationEngine.CalculateTotalEffort(request.MeetingEffortHours, request.WorkEffortHours);

        // Auto-link or create work item if task number given
        int? workItemId = request.WorkItemId;
        if (!workItemId.HasValue && !string.IsNullOrWhiteSpace(request.TaskNumber))
        {
            var taskNum = request.TaskNumber.Trim();
            var existingWorkItem = await _context.WorkItems.FirstOrDefaultAsync(w => w.WorkItemNumber == taskNum);
            if (existingWorkItem != null)
            {
                workItemId = existingWorkItem.WorkItemId;
            }
            else
            {
                var newWorkItem = new WorkItem
                {
                    WorkItemNumber = taskNum,
                    Title = request.Description.Length > 100 ? request.Description[..100] : request.Description,
                    Description = request.Description,
                    Status = request.Status
                };
                await _context.WorkItems.AddAsync(newWorkItem);
                await _context.SaveChangesAsync();
                workItemId = newWorkItem.WorkItemId;
            }
        }

        var entry = new WorkEntry
        {
            EmployeeId = empId,
            WorkDate = request.WorkDate.Date,
            WorkItemId = workItemId,
            TaskNumber = request.TaskNumber,
            Description = request.Description,
            CategoryId = request.CategoryId,
            MeetingId = request.MeetingId,
            MeetingName = request.MeetingName,
            PlannedEffortHours = request.PlannedEffortHours,
            MeetingEffortHours = request.MeetingEffortHours,
            WorkEffortHours = request.WorkEffortHours,
            TotalEffortHours = total,
            Status = request.Status,
            Remarks = request.Remarks
        };

        await _context.WorkEntries.AddAsync(entry);
        await _context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(request.Remarks))
        {
            await _context.WorkEntryRemarks.AddAsync(new WorkEntryRemark
            {
                WorkEntryId = entry.WorkEntryId,
                UserId = _currentUserService.UserId,
                RemarkText = request.Remarks,
                Status = request.Status
            });
            await _context.SaveChangesAsync();
        }

        return await GetWorkEntryByIdAsync(entry.WorkEntryId);
    }

    public async Task<ApiResponse<WorkEntryDto>> UpdateWorkEntryAsync(int id, UpdateWorkEntryDto request)
    {
        var entry = await _context.WorkEntries.FindAsync(id);
        if (entry == null) return ApiResponse<WorkEntryDto>.Fail("Work entry not found.");

        entry.WorkDate = request.WorkDate.Date;
        entry.WorkItemId = request.WorkItemId;
        entry.TaskNumber = request.TaskNumber;
        entry.Description = request.Description;
        entry.CategoryId = request.CategoryId;
        entry.MeetingId = request.MeetingId;
        entry.MeetingName = request.MeetingName;
        entry.PlannedEffortHours = request.PlannedEffortHours;
        entry.MeetingEffortHours = request.MeetingEffortHours;
        entry.WorkEffortHours = request.WorkEffortHours;
        entry.TotalEffortHours = CalculationEngine.CalculateTotalEffort(request.MeetingEffortHours, request.WorkEffortHours);
        entry.Status = request.Status;

        if (entry.Remarks != request.Remarks && !string.IsNullOrWhiteSpace(request.Remarks))
        {
            entry.Remarks = request.Remarks;
            await _context.WorkEntryRemarks.AddAsync(new WorkEntryRemark
            {
                WorkEntryId = entry.WorkEntryId,
                UserId = _currentUserService.UserId,
                RemarkText = request.Remarks,
                Status = request.Status
            });
        }

        await _context.SaveChangesAsync();
        return await GetWorkEntryByIdAsync(entry.WorkEntryId);
    }

    public async Task<ApiResponse> DeleteWorkEntryAsync(int id)
    {
        var entry = await _context.WorkEntries.FindAsync(id);
        if (entry == null) return ApiResponse.Fail("Work entry not found.");

        entry.IsDeleted = true;
        await _context.SaveChangesAsync();
        return ApiResponse.Ok("Work entry deleted successfully.");
    }

    public async Task<ApiResponse<List<WorkEntryDto>>> CopyEntriesAsync(CopyWorkEntriesRequestDto request)
    {
        var empId = await ResolveEmployeeIdAsync(request.EmployeeId);
        var sourceDate = request.SourceDate.Date;
        var targetDate = request.TargetDate.Date;

        var sourceQuery = _context.WorkEntries
            .Where(e => e.EmployeeId == empId && e.WorkDate.Date == sourceDate);

        if (request.SelectedEntryIds != null && request.SelectedEntryIds.Any())
        {
            sourceQuery = sourceQuery.Where(e => request.SelectedEntryIds.Contains(e.WorkEntryId));
        }

        var sourceEntries = await sourceQuery.ToListAsync();
        if (!sourceEntries.Any())
        {
            return ApiResponse<List<WorkEntryDto>>.Fail("No entries found on source date to copy.");
        }

        var copiedEntries = new List<WorkEntry>();
        foreach (var s in sourceEntries)
        {
            var newEntry = new WorkEntry
            {
                EmployeeId = empId,
                WorkDate = targetDate,
                WorkItemId = s.WorkItemId,
                TaskNumber = s.TaskNumber,
                Description = s.Description,
                CategoryId = s.CategoryId,
                MeetingId = s.MeetingId,
                MeetingName = s.MeetingName,
                PlannedEffortHours = s.PlannedEffortHours,
                MeetingEffortHours = s.MeetingEffortHours,
                WorkEffortHours = s.WorkEffortHours,
                TotalEffortHours = s.TotalEffortHours,
                Status = "In Progress",
                Remarks = $"Copied from {sourceDate:yyyy-MM-dd}"
            };
            copiedEntries.Add(newEntry);
        }

        await _context.WorkEntries.AddRangeAsync(copiedEntries);
        await _context.SaveChangesAsync();

        var result = await GetDailyWorkAsync(targetDate, empId);
        return ApiResponse<List<WorkEntryDto>>.Ok(result.Data?.Entries ?? new List<WorkEntryDto>(), "Entries copied successfully.");
    }

    public async Task<ApiResponse<WorkEntryRemarkDto>> AddRemarkAsync(int workEntryId, AddRemarkDto request)
    {
        var entry = await _context.WorkEntries.FindAsync(workEntryId);
        if (entry == null) return ApiResponse<WorkEntryRemarkDto>.Fail("Work entry not found.");

        if (!string.IsNullOrWhiteSpace(request.Status))
            entry.Status = request.Status;

        entry.Remarks = request.RemarkText;

        var remark = new WorkEntryRemark
        {
            WorkEntryId = workEntryId,
            UserId = _currentUserService.UserId,
            RemarkText = request.RemarkText,
            Status = request.Status ?? entry.Status
        };

        await _context.WorkEntryRemarks.AddAsync(remark);
        await _context.SaveChangesAsync();

        return ApiResponse<WorkEntryRemarkDto>.Ok(new WorkEntryRemarkDto
        {
            RemarkId = remark.RemarkId,
            WorkEntryId = remark.WorkEntryId,
            Username = _currentUserService.Username ?? "User",
            RemarkText = remark.RemarkText,
            Status = remark.Status,
            CreatedAt = remark.CreatedAt
        });
    }
}
