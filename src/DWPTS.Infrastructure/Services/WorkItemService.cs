using Microsoft.EntityFrameworkCore;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class WorkItemService : IWorkItemService
{
    private readonly DWPTSDbContext _context;

    public WorkItemService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<WorkItemDto>>> GetWorkItemsAsync(PaginationFilter filter, string? status = null, int? typeId = null)
    {
        var query = _context.WorkItems
            .Include(w => w.WorkItemType)
            .Include(w => w.WorkEntries)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(w => w.Status == status);

        if (typeId.HasValue)
            query = query.Where(w => w.WorkItemTypeId == typeId);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.ToLower();
            query = query.Where(w => w.WorkItemNumber.ToLower().Contains(search) || w.Title.ToLower().Contains(search) || (w.Description != null && w.Description.ToLower().Contains(search)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(w => w.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(w => new WorkItemDto
            {
                WorkItemId = w.WorkItemId,
                WorkItemNumber = w.WorkItemNumber,
                WorkItemTypeId = w.WorkItemTypeId,
                WorkItemTypeName = w.WorkItemType != null ? w.WorkItemType.Name : null,
                Title = w.Title,
                Description = w.Description,
                ExternalReference = w.ExternalReference,
                Status = w.Status,
                Priority = w.Priority,
                DueDate = w.DueDate,
                TotalEffortLoggedHours = w.WorkEntries.Sum(e => e.TotalEffortHours),
                DaysWorkedCount = w.WorkEntries.Select(e => e.WorkDate).Distinct().Count(),
                FirstWorkedDate = w.WorkEntries.OrderBy(e => e.WorkDate).Select(e => (DateTime?)e.WorkDate).FirstOrDefault(),
                LastWorkedDate = w.WorkEntries.OrderByDescending(e => e.WorkDate).Select(e => (DateTime?)e.WorkDate).FirstOrDefault(),
                CreatedAt = w.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<WorkItemDto>>.Ok(new PagedResult<WorkItemDto>
        {
            Items = items,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalCount = total
        });
    }

    public async Task<ApiResponse<WorkItemDto>> GetWorkItemByIdAsync(int id)
    {
        var w = await _context.WorkItems
            .Include(w => w.WorkItemType)
            .Include(w => w.WorkEntries)
            .FirstOrDefaultAsync(w => w.WorkItemId == id);

        if (w == null) return ApiResponse<WorkItemDto>.Fail("Work item not found.");

        return ApiResponse<WorkItemDto>.Ok(new WorkItemDto
        {
            WorkItemId = w.WorkItemId,
            WorkItemNumber = w.WorkItemNumber,
            WorkItemTypeId = w.WorkItemTypeId,
            WorkItemTypeName = w.WorkItemType?.Name,
            Title = w.Title,
            Description = w.Description,
            ExternalReference = w.ExternalReference,
            Status = w.Status,
            Priority = w.Priority,
            DueDate = w.DueDate,
            TotalEffortLoggedHours = w.WorkEntries.Sum(e => e.TotalEffortHours),
            DaysWorkedCount = w.WorkEntries.Select(e => e.WorkDate).Distinct().Count(),
            FirstWorkedDate = w.WorkEntries.OrderBy(e => e.WorkDate).Select(e => (DateTime?)e.WorkDate).FirstOrDefault(),
            LastWorkedDate = w.WorkEntries.OrderByDescending(e => e.WorkDate).Select(e => (DateTime?)e.WorkDate).FirstOrDefault(),
            CreatedAt = w.CreatedAt
        });
    }

    public async Task<ApiResponse<WorkItemDto>> GetWorkItemByNumberAsync(string number)
    {
        var w = await _context.WorkItems
            .Include(w => w.WorkItemType)
            .Include(w => w.WorkEntries)
            .FirstOrDefaultAsync(w => w.WorkItemNumber == number);

        if (w == null) return ApiResponse<WorkItemDto>.Fail("Work item not found.");

        return await GetWorkItemByIdAsync(w.WorkItemId);
    }

    public async Task<ApiResponse<WorkItemDto>> CreateWorkItemAsync(CreateWorkItemDto request)
    {
        if (await _context.WorkItems.AnyAsync(w => w.WorkItemNumber == request.WorkItemNumber))
            return ApiResponse<WorkItemDto>.Fail($"Work item with number '{request.WorkItemNumber}' already exists.");

        var item = new WorkItem
        {
            WorkItemNumber = request.WorkItemNumber.Trim(),
            WorkItemTypeId = request.WorkItemTypeId,
            Title = request.Title.Trim(),
            Description = request.Description,
            ExternalReference = request.ExternalReference,
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate
        };

        await _context.WorkItems.AddAsync(item);
        await _context.SaveChangesAsync();

        return await GetWorkItemByIdAsync(item.WorkItemId);
    }

    public async Task<ApiResponse<WorkItemDto>> UpdateWorkItemAsync(int id, UpdateWorkItemDto request)
    {
        var item = await _context.WorkItems.FindAsync(id);
        if (item == null) return ApiResponse<WorkItemDto>.Fail("Work item not found.");

        item.WorkItemNumber = request.WorkItemNumber.Trim();
        item.WorkItemTypeId = request.WorkItemTypeId;
        item.Title = request.Title.Trim();
        item.Description = request.Description;
        item.ExternalReference = request.ExternalReference;
        item.Status = request.Status;
        item.Priority = request.Priority;
        item.DueDate = request.DueDate;

        await _context.SaveChangesAsync();
        return await GetWorkItemByIdAsync(item.WorkItemId);
    }

    public async Task<ApiResponse<WorkItemTimelineDto>> GetWorkItemTimelineAsync(int id)
    {
        var w = await _context.WorkItems
            .Include(w => w.WorkEntries)
                .ThenInclude(e => e.Employee)
            .FirstOrDefaultAsync(w => w.WorkItemId == id);

        if (w == null) return ApiResponse<WorkItemTimelineDto>.Fail("Work item not found.");

        var timeline = w.WorkEntries
            .OrderBy(e => e.WorkDate)
            .Select(e => new WorkItemTimelineItemDto
            {
                WorkDate = e.WorkDate,
                EffortHours = e.TotalEffortHours,
                Status = e.Status,
                Remarks = e.Remarks,
                EmployeeName = e.Employee.FullName
            })
            .ToList();

        return ApiResponse<WorkItemTimelineDto>.Ok(new WorkItemTimelineDto
        {
            WorkItemId = w.WorkItemId,
            WorkItemNumber = w.WorkItemNumber,
            Title = w.Title,
            TotalEffort = timeline.Sum(t => t.EffortHours),
            Timeline = timeline
        });
    }
}
