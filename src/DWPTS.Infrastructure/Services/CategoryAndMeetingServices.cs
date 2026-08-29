using Microsoft.EntityFrameworkCore;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Enums;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly DWPTSDbContext _context;

    public CategoryService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<CategoryDto>>> GetAllCategoriesAsync()
    {
        // Auto-seed default generic categories if none exist
        if (!await _context.WorkEntryCategories.AnyAsync())
        {
            var defaultCategories = new List<WorkEntryCategory>
            {
                new() { Name = "Development", Description = "Core software development & feature building", ColorCode = "#2563eb", IsActive = true },
                new() { Name = "Bug Fix", Description = "Resolving defects, tickets & issues", ColorCode = "#dc2626", IsActive = true },
                new() { Name = "Support", Description = "Client, user & production support", ColorCode = "#ea580c", IsActive = true },
                new() { Name = "Utility", Description = "Data upload, automation & scripts", ColorCode = "#0d9488", IsActive = true },
                new() { Name = "Discussion", Description = "Technical and functional discussions", ColorCode = "#8b5cf6", IsActive = true },
                new() { Name = "Code Review", Description = "Peer code reviews & PR walkthroughs", ColorCode = "#0284c7", IsActive = true },
                new() { Name = "Testing", Description = "Unit, integration and regression testing", ColorCode = "#16a34a", IsActive = true },
                new() { Name = "Deployment", Description = "Release and deployment activities", ColorCode = "#7c3aed", IsActive = true },
                new() { Name = "Documentation", Description = "Technical docs and specifications", ColorCode = "#64748b", IsActive = true },
                new() { Name = "General", Description = "General administrative & team activities", ColorCode = "#059669", IsActive = true }
            };
            await _context.WorkEntryCategories.AddRangeAsync(defaultCategories);
            await _context.SaveChangesAsync();
        }

        var rawCategories = await _context.WorkEntryCategories
            .Include(c => c.WorkEntries)
            .OrderBy(c => c.Name)
            .ToListAsync();

        var categories = rawCategories.Select(c => new CategoryDto
        {
            CategoryId = c.CategoryId,
            Name = c.Name,
            Description = c.Description,
            ColorCode = c.ColorCode,
            IsActive = c.IsActive,
            TotalEntriesCount = c.WorkEntries.Count,
            TotalEffortHours = c.WorkEntries.Sum(e => e.TotalEffortHours)
        }).ToList();

        return ApiResponse<List<CategoryDto>>.Ok(categories);
    }

    public async Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryDto request)
    {
        if (await _context.WorkEntryCategories.AnyAsync(c => c.Name == request.Name))
            return ApiResponse<CategoryDto>.Fail($"Category '{request.Name}' already exists.");

        var cat = new WorkEntryCategory
        {
            Name = request.Name.Trim(),
            Description = request.Description,
            ColorCode = request.ColorCode ?? "#3b82f6",
            IsActive = true
        };

        await _context.WorkEntryCategories.AddAsync(cat);
        await _context.SaveChangesAsync();

        return ApiResponse<CategoryDto>.Ok(new CategoryDto
        {
            CategoryId = cat.CategoryId,
            Name = cat.Name,
            Description = cat.Description,
            ColorCode = cat.ColorCode,
            IsActive = cat.IsActive
        });
    }

    public async Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(int id, CreateCategoryDto request)
    {
        var cat = await _context.WorkEntryCategories.FindAsync(id);
        if (cat == null) return ApiResponse<CategoryDto>.Fail("Category not found.");

        cat.Name = request.Name.Trim();
        cat.Description = request.Description;
        cat.ColorCode = request.ColorCode;

        await _context.SaveChangesAsync();

        return ApiResponse<CategoryDto>.Ok(new CategoryDto
        {
            CategoryId = cat.CategoryId,
            Name = cat.Name,
            Description = cat.Description,
            ColorCode = cat.ColorCode,
            IsActive = cat.IsActive
        });
    }

    public async Task<ApiResponse> DeleteCategoryAsync(int id)
    {
        var cat = await _context.WorkEntryCategories.FindAsync(id);
        if (cat == null) return ApiResponse.Fail("Category not found.");

        cat.IsDeleted = true;
        await _context.SaveChangesAsync();
        return ApiResponse.Ok("Category deleted.");
    }
}

public class MeetingService : IMeetingService
{
    private readonly DWPTSDbContext _context;

    public MeetingService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<MeetingDto>>> GetAllMeetingsAsync()
    {
        if (!await _context.Meetings.AnyAsync())
        {
            var defaultMeetings = new List<Meeting>
            {
                new() { MeetingName = "Daily Stand Up", DefaultDurationHours = 0.5m, Description = "Daily Scrum standup", IsActive = true },
                new() { MeetingName = "BYD SYNC UP Meeting", DefaultDurationHours = 1.0m, Description = "BYD integration sync", IsActive = true },
                new() { MeetingName = "DMS Walkthrough Meeting", DefaultDurationHours = 1.0m, Description = "DMS walkthrough", IsActive = true },
                new() { MeetingName = "CRM Walkthrough Meeting", DefaultDurationHours = 1.0m, Description = "CRM feature review", IsActive = true },
                new() { MeetingName = "Sprint Planning", DefaultDurationHours = 1.0m, Description = "Sprint planning", IsActive = true },
                new() { MeetingName = "FC Clarification", DefaultDurationHours = 0.5m, Description = "FC clarification review", IsActive = true }
            };
            await _context.Meetings.AddRangeAsync(defaultMeetings);
            await _context.SaveChangesAsync();
        }

        var meetings = await _context.Meetings
            .Include(m => m.MeetingType)
            .OrderBy(m => m.MeetingName)
            .Select(m => new MeetingDto
            {
                MeetingId = m.MeetingId,
                MeetingName = m.MeetingName,
                MeetingTypeId = m.MeetingTypeId,
                MeetingTypeName = m.MeetingType != null ? m.MeetingType.Name : null,
                DefaultDurationHours = m.DefaultDurationHours,
                Description = m.Description,
                IsActive = m.IsActive
            })
            .ToListAsync();

        return ApiResponse<List<MeetingDto>>.Ok(meetings);
    }

    public async Task<ApiResponse<MeetingDto>> CreateMeetingAsync(MeetingDto request)
    {
        var meeting = new Meeting
        {
            MeetingName = request.MeetingName.Trim(),
            MeetingTypeId = request.MeetingTypeId,
            DefaultDurationHours = request.DefaultDurationHours,
            Description = request.Description,
            IsActive = true
        };

        await _context.Meetings.AddAsync(meeting);
        await _context.SaveChangesAsync();

        request.MeetingId = meeting.MeetingId;
        return ApiResponse<MeetingDto>.Ok(request);
    }

    public async Task<ApiResponse<MeetingDto>> UpdateMeetingAsync(int id, MeetingDto request)
    {
        var meeting = await _context.Meetings.FindAsync(id);
        if (meeting == null) return ApiResponse<MeetingDto>.Fail("Meeting not found.");

        meeting.MeetingName = request.MeetingName.Trim();
        meeting.MeetingTypeId = request.MeetingTypeId;
        meeting.DefaultDurationHours = request.DefaultDurationHours;
        meeting.Description = request.Description;
        meeting.IsActive = request.IsActive;

        await _context.SaveChangesAsync();
        return ApiResponse<MeetingDto>.Ok(request);
    }

        public async Task<ApiResponse> DeleteMeetingAsync(int id)
    {
        var meeting = await _context.Meetings.FindAsync(id);
        if (meeting == null) return ApiResponse.Fail("Meeting not found.");

        _context.Meetings.Remove(meeting);
        await _context.SaveChangesAsync();
        return ApiResponse.Ok("Meeting deleted.");
    }

    public async Task<ApiResponse<List<MeetingAnalysisDto>>> GetMeetingAnalysisAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var query = _context.WorkEntries
            .Where(e => e.MeetingEffortHours > 0);

        if (fromDate.HasValue) query = query.Where(e => e.WorkDate >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(e => e.WorkDate <= toDate.Value);

        var entries = await query.Include(e => e.Meeting).ToListAsync();
        var totalMeetingHoursAll = entries.Sum(e => e.MeetingEffortHours);

        var grouped = entries
            .GroupBy(e => e.Meeting != null ? e.Meeting.MeetingName : (e.MeetingName ?? "General Meeting"))
            .Select(g => new
            {
                MeetingName = g.Key,
                TotalHours = g.Sum(e => e.MeetingEffortHours),
                Count = g.Count(),
                Avg = g.Any() ? g.Average(e => e.MeetingEffortHours) : 0m
            })
            .ToList();

        var result = grouped.Select(g => new MeetingAnalysisDto
        {
            MeetingName = g.MeetingName,
            TotalHours = Math.Round(g.TotalHours, 2),
            OccurrencesCount = g.Count,
            AverageDurationHours = Math.Round(g.Avg, 2),
            PercentageOfTotalEffort = totalMeetingHoursAll > 0 ? Math.Round((g.TotalHours / totalMeetingHoursAll) * 100, 2) : 0
        }).OrderByDescending(r => r.TotalHours).ToList();

        return ApiResponse<List<MeetingAnalysisDto>>.Ok(result);
    }
}
