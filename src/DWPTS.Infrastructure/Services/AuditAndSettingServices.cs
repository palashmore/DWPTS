using Microsoft.EntityFrameworkCore;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class AuditLogService : IAuditLogService
{
    private readonly DWPTSDbContext _context;

    public AuditLogService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<AuditLogDto>>> GetAuditLogsAsync(PaginationFilter filter)
    {
        var query = _context.AuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var s = filter.SearchTerm.ToLower();
            query = query.Where(a => a.Action.ToLower().Contains(s) || a.EntityName.ToLower().Contains(s) || (a.Username != null && a.Username.ToLower().Contains(s)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(a => new AuditLogDto
            {
                AuditLogId = a.AuditLogId,
                Username = a.Username,
                Action = a.Action,
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                IpAddress = a.IpAddress,
                Timestamp = a.Timestamp
            })
            .ToListAsync();

        return ApiResponse<PagedResult<AuditLogDto>>.Ok(new PagedResult<AuditLogDto>
        {
            Items = items,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalCount = total
        });
    }

    public async Task LogAsync(string action, string entityName, string? entityId, string? oldValues, string? newValues, int? userId = null, string? username = null)
    {
        var log = new AuditLog
        {
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            UserId = userId,
            Username = username,
            Timestamp = DateTime.UtcNow
        };

        await _context.AuditLogs.AddAsync(log);
        await _context.SaveChangesAsync();
    }
}

public class NotificationService : INotificationService
{
    private readonly DWPTSDbContext _context;

    public NotificationService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(int userId)
    {
        var items = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                NotificationId = n.NotificationId,
                Title = n.Title,
                Message = n.Message,
                NotificationType = n.NotificationType,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                ActionUrl = n.ActionUrl,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<NotificationDto>>.Ok(items);
    }

    public async Task<ApiResponse> MarkAsReadAsync(int notificationId)
    {
        var n = await _context.Notifications.FindAsync(notificationId);
        if (n != null)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        return ApiResponse.Ok();
    }

    public async Task<ApiResponse> CreateNotificationAsync(int userId, string title, string message, string type = "Info", string? actionUrl = null)
    {
        var n = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            NotificationType = type,
            ActionUrl = actionUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Notifications.AddAsync(n);
        await _context.SaveChangesAsync();
        return ApiResponse.Ok();
    }
}

public class SystemSettingService : ISystemSettingService
{
    private readonly DWPTSDbContext _context;

    public SystemSettingService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<SystemSettingDto>>> GetAllSettingsAsync()
    {
        var settings = await _context.SystemSettings
            .Select(s => new SystemSettingDto
            {
                SettingId = s.SettingId,
                Key = s.Key,
                Value = s.Value,
                Description = s.Description,
                DataType = s.DataType,
                IsEditable = s.IsEditable
            })
            .ToListAsync();

        return ApiResponse<List<SystemSettingDto>>.Ok(settings);
    }

    public async Task<ApiResponse<SystemSettingDto>> UpdateSettingAsync(string key, string value)
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (setting == null) return ApiResponse<SystemSettingDto>.Fail("Setting not found.");

        setting.Value = value;
        await _context.SaveChangesAsync();

        return ApiResponse<SystemSettingDto>.Ok(new SystemSettingDto
        {
            SettingId = setting.SettingId,
            Key = setting.Key,
            Value = setting.Value,
            Description = setting.Description,
            DataType = setting.DataType,
            IsEditable = setting.IsEditable
        });
    }

    public async Task<string> GetValueAsync(string key, string defaultValue = "")
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
        return setting?.Value ?? defaultValue;
    }
}
