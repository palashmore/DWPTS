using DWPTS.Domain.Entities;
using DWPTS.Application.DTOs;
using DWPTS.Shared.Models;

namespace DWPTS.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request);
    Task<ApiResponse<UserProfileDto>> GetProfileAsync(int userId);
    Task<ApiResponse<UserProfileDto>> RegisterAsync(RegisterRequestDto request);
}

public interface IUserService
{
    Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(PaginationFilter filter);
    Task<ApiResponse<UserDto>> GetUserByIdAsync(int id);
    Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto request);
    Task<ApiResponse<UserDto>> UpdateUserAsync(int id, UpdateUserDto request);
    Task<ApiResponse> DeleteUserAsync(int id);
    Task<ApiResponse<List<string>>> GetRolesAsync();
}

public interface IEmployeeService
{
    Task<ApiResponse<List<EmployeeDto>>> GetAllEmployeesAsync();
    Task<ApiResponse<EmployeeDto>> GetEmployeeByIdAsync(int id);
    Task<ApiResponse<EmployeeDto>> CreateEmployeeAsync(CreateEmployeeDto request);
    Task<ApiResponse<EmployeeDto>> UpdateEmployeeAsync(int id, UpdateEmployeeDto request);
}

public interface IWorkItemService
{
    Task<ApiResponse<PagedResult<WorkItemDto>>> GetWorkItemsAsync(PaginationFilter filter, string? status = null, int? typeId = null);
    Task<ApiResponse<WorkItemDto>> GetWorkItemByIdAsync(int id);
    Task<ApiResponse<WorkItemDto>> GetWorkItemByNumberAsync(string number);
    Task<ApiResponse<WorkItemDto>> CreateWorkItemAsync(CreateWorkItemDto request);
    Task<ApiResponse<WorkItemDto>> UpdateWorkItemAsync(int id, UpdateWorkItemDto request);
    Task<ApiResponse<WorkItemTimelineDto>> GetWorkItemTimelineAsync(int id);
}

public interface IWorkEntryService
{
    Task<ApiResponse<DailyWorkScreenDto>> GetDailyWorkAsync(DateTime date, int? employeeId = null);
    Task<ApiResponse<PagedResult<WorkEntryDto>>> GetWorkEntriesAsync(WorkEntryFilterDto filter);
    Task<ApiResponse<WorkEntryDto>> GetWorkEntryByIdAsync(int id);
    Task<ApiResponse<WorkEntryDto>> CreateWorkEntryAsync(CreateWorkEntryDto request);
    Task<ApiResponse<WorkEntryDto>> UpdateWorkEntryAsync(int id, UpdateWorkEntryDto request);
    Task<ApiResponse> DeleteWorkEntryAsync(int id);
    Task<ApiResponse<List<WorkEntryDto>>> CopyEntriesAsync(CopyWorkEntriesRequestDto request);
    Task<ApiResponse<WorkEntryRemarkDto>> AddRemarkAsync(int workEntryId, AddRemarkDto request);
}

public interface ICategoryService
{
    Task<ApiResponse<List<CategoryDto>>> GetAllCategoriesAsync();
    Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryDto request);
    Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(int id, CreateCategoryDto request);
    Task<ApiResponse> DeleteCategoryAsync(int id);
}

public interface IMeetingService
{
    Task<ApiResponse<List<MeetingDto>>> GetAllMeetingsAsync();
    Task<ApiResponse<MeetingDto>> CreateMeetingAsync(MeetingDto request);
    Task<ApiResponse<MeetingDto>> UpdateMeetingAsync(int id, MeetingDto request);
    Task<ApiResponse> DeleteMeetingAsync(int id);
    Task<ApiResponse<List<MeetingAnalysisDto>>> GetMeetingAnalysisAsync(DateTime? fromDate = null, DateTime? toDate = null);
}

public interface ICalendarService
{
    Task<ApiResponse<CalendarMonthDto>> GetMonthlyCalendarAsync(int year, int month, int? employeeId = null);
}

public interface IHolidayService
{
    Task<ApiResponse<List<HolidayDto>>> GetHolidaysAsync(int year);
    Task<ApiResponse<HolidayDto>> CreateHolidayAsync(HolidayDto request);
    Task<ApiResponse> DeleteHolidayAsync(int id);
}

public interface ILeaveService
{
    Task<ApiResponse<List<LeaveDto>>> GetLeavesAsync(int? employeeId = null, int? year = null);
    Task<ApiResponse<LeaveDto>> ApplyLeaveAsync(CreateLeaveDto request);
    Task<ApiResponse<LeaveDto>> UpdateLeaveStatusAsync(int id, UpdateLeaveStatusDto request);
}

public interface IDashboardService
{
    Task<ApiResponse<DashboardSummaryDto>> GetDashboardAsync(DateTime date, int? employeeId = null);
}

public interface IReportService
{
    Task<ApiResponse<DailyWorkScreenDto>> GetDailyReportAsync(DateTime date, int? employeeId = null);
    Task<ApiResponse<WeeklyReportDto>> GetWeeklyReportAsync(DateTime weekStartDate, int? employeeId = null);
    Task<ApiResponse<MonthlyReportDto>> GetMonthlyReportAsync(int year, int month, int? employeeId = null);
    Task<ApiResponse<YearlyReportDto>> GetYearlyReportAsync(int year, int? employeeId = null);
}

public interface IExcelImportService
{
    Task<ApiResponse<ImportPreviewDto>> PreviewExcelAsync(Stream fileStream, string fileName);
    Task<ApiResponse<ImportResultDto>> ConfirmImportAsync(ConfirmImportRequestDto request);
    Task<ApiResponse<List<ImportJob>>> GetImportHistoryAsync();
}

public interface IExportService
{
    Task<byte[]> ExportDailyExcelAsync(DateTime date, int? employeeId = null);
    Task<byte[]> ExportWeeklyExcelAsync(DateTime weekStartDate, int? employeeId = null);
    Task<byte[]> ExportMonthlyExcelAsync(int year, int month, int? employeeId = null);
    Task<byte[]> ExportYearlyExcelAsync(int year, int? employeeId = null);
    Task<byte[]> ExportAllDataCsvAsync(WorkEntryFilterDto filter);
    Task<byte[]> ExportWorkItemHistoryPdfAsync(int workItemId);
}

public interface IAuditLogService
{
    Task<ApiResponse<PagedResult<AuditLogDto>>> GetAuditLogsAsync(PaginationFilter filter);
    Task LogAsync(string action, string entityName, string? entityId, string? oldValues, string? newValues, int? userId = null, string? username = null);
}

public interface INotificationService
{
    Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(int userId);
    Task<ApiResponse> MarkAsReadAsync(int notificationId);
    Task<ApiResponse> CreateNotificationAsync(int userId, string title, string message, string type = "Info", string? actionUrl = null);
}

public interface ISystemSettingService
{
    Task<ApiResponse<List<SystemSettingDto>>> GetAllSettingsAsync();
    Task<ApiResponse<SystemSettingDto>> UpdateSettingAsync(string key, string value);
    Task<string> GetValueAsync(string key, string defaultValue = "");
}


