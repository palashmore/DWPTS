using System.Data;
using System.Text.RegularExpressions;
using ExcelDataReader;
using Microsoft.EntityFrameworkCore;
using DWPTS.Application.Common;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Application.Services;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Enums;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class ExcelImportService : IExcelImportService
{
    private readonly DWPTSDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ExcelImportService(DWPTSDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
        System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
    }

    public async Task<ApiResponse<ImportPreviewDto>> PreviewExcelAsync(Stream fileStream, string fileName)
    {
        using var reader = ExcelReaderFactory.CreateReader(fileStream);
        var dataset = reader.AsDataSet(new ExcelDataSetConfiguration
        {
            ConfigureDataTable = _ => new ExcelDataTableConfiguration { UseHeaderRow = false }
        });

        var detectedSheets = new List<string>();
        foreach (DataTable table in dataset.Tables)
        {
            detectedSheets.Add(table.TableName);
        }

        var previewRows = new List<ImportRowPreviewDto>();
        int validCount = 0;
        int warningCount = 0;
        int errorCount = 0;
        int duplicateCount = 0;

        var existingEntries = await _context.WorkEntries
            .Select(e => new { e.WorkDate, e.Description, e.TotalEffortHours })
            .ToListAsync();

        foreach (DataTable table in dataset.Tables)
        {
            var sheetName = table.TableName;
            if (sheetName.Equals("Weekly Summary", StringComparison.OrdinalIgnoreCase) ||
                sheetName.Equals("Yearly Summary", StringComparison.OrdinalIgnoreCase) ||
                sheetName.Equals("Current Month", StringComparison.OrdinalIgnoreCase) ||
                sheetName.Equals("AllData", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            DateTime? currentDate = null;

            for (int r = 1; r < table.Rows.Count; r++) // Skip row 0 (headers)
            {
                var row = table.Rows[r];
                var dateObj = row[0];
                var taskObj = row.ItemArray.Length > 2 ? row[2] : null;
                var catObj = row.ItemArray.Length > 3 ? row[3] : null;
                var meetObj = row.ItemArray.Length > 4 ? row[4] : null;
                var meetEffObj = row.ItemArray.Length > 5 ? row[5] : null;
                var workEffObj = row.ItemArray.Length > 6 ? row[6] : null;
                var remObj = row.ItemArray.Length > 8 ? row[8] : null;

                if (dateObj != null && dateObj != DBNull.Value)
                {
                    if (dateObj is DateTime dt) currentDate = dt.Date;
                    else if (DateTime.TryParse(dateObj.ToString(), out var dtParsed)) currentDate = dtParsed.Date;
                }

                var taskRaw = taskObj?.ToString()?.Trim() ?? string.Empty;
                var catRaw = catObj?.ToString()?.Trim() ?? string.Empty;
                var meetRaw = meetObj?.ToString()?.Trim() ?? string.Empty;
                var remRaw = remObj?.ToString()?.Trim() ?? string.Empty;

                decimal.TryParse(meetEffObj?.ToString(), out var meetEff);
                decimal.TryParse(workEffObj?.ToString(), out var workEff);
                var totalEff = CalculationEngine.CalculateTotalEffort(meetEff, workEff);

                if (string.IsNullOrWhiteSpace(taskRaw) && string.IsNullOrWhiteSpace(catRaw) &&
                    string.IsNullOrWhiteSpace(meetRaw) && meetEff == 0 && workEff == 0)
                {
                    continue;
                }

                var (normalizedTaskNo, normalizedTitle) = ExtractTaskDetails(taskRaw);

                var status = "Valid";
                string? msg = null;

                if (!currentDate.HasValue)
                {
                    status = "Error";
                    msg = "Missing date for work entry.";
                    errorCount++;
                }
                else if (taskRaw.Equals("Holiday", StringComparison.OrdinalIgnoreCase))
                {
                    status = "Warning";
                    msg = "Holiday marker row.";
                    warningCount++;
                }
                else if (taskRaw.Equals("Leave", StringComparison.OrdinalIgnoreCase))
                {
                    status = "Warning";
                    msg = "Leave marker row.";
                    warningCount++;
                }
                else
                {
                    var isDup = existingEntries.Any(e => e.WorkDate.Date == currentDate.Value.Date && e.Description == taskRaw && e.TotalEffortHours == totalEff);
                    if (isDup)
                    {
                        status = "Duplicate";
                        msg = "Potential duplicate record exists in database.";
                        duplicateCount++;
                    }
                    else
                    {
                        validCount++;
                    }
                }

                previewRows.Add(new ImportRowPreviewDto
                {
                    RowIndex = r + 1,
                    SheetName = sheetName,
                    Date = currentDate,
                    RawTask = taskRaw,
                    NormalizedTaskNumber = normalizedTaskNo,
                    NormalizedTitle = normalizedTitle,
                    Category = catRaw,
                    Meeting = meetRaw,
                    MeetingEffort = meetEff,
                    WorkEffort = workEff,
                    TotalEffort = totalEff,
                    Remarks = remRaw,
                    Status = status,
                    Message = msg
                });
            }
        }

        var result = new ImportPreviewDto
        {
            FileName = fileName,
            TotalSheets = detectedSheets.Count,
            TotalRows = previewRows.Count,
            ValidRows = validCount,
            WarningRows = warningCount,
            ErrorRows = errorCount,
            DuplicateRows = duplicateCount,
            DetectedSheets = detectedSheets,
            PreviewRows = previewRows
        };

        return ApiResponse<ImportPreviewDto>.Ok(result);
    }

    public async Task<ApiResponse<ImportResultDto>> ConfirmImportAsync(ConfirmImportRequestDto request)
    {
        var empId = request.EmployeeId ?? _currentUserService.EmployeeId ?? 1;

        var job = new ImportJob
        {
            FileName = "Daily Task Planning.xlsx",
            TotalRows = request.RowsToImport.Count,
            Status = ImportJobStatusEnum.Processing,
            CreatedBy = _currentUserService.Username ?? "Admin"
        };
        await _context.ImportJobs.AddAsync(job);
        await _context.SaveChangesAsync();

        int imported = 0;
        int skipped = 0;
        int errors = 0;
        var messages = new List<string>();

        var categories = await _context.WorkEntryCategories.ToListAsync();
        var meetings = await _context.Meetings.ToListAsync();

        foreach (var r in request.RowsToImport)
        {
            if (!r.Date.HasValue)
            {
                skipped++;
                continue;
            }

            try
            {
                var taskRaw = r.RawTask?.Trim() ?? string.Empty;

                // Handle Holiday
                if (taskRaw.Equals("Holiday", StringComparison.OrdinalIgnoreCase))
                {
                    var hasHoliday = await _context.Holidays.AnyAsync(h => h.HolidayDate.Date == r.Date.Value.Date);
                    if (!hasHoliday)
                    {
                        await _context.Holidays.AddAsync(new Holiday
                        {
                            HolidayDate = r.Date.Value.Date,
                            HolidayName = "Company Holiday / Weekend",
                            HolidayType = HolidayTypeEnum.PublicHoliday,
                            IsActive = true
                        });
                    }
                    imported++;
                    continue;
                }

                // Handle Leave
                if (taskRaw.Equals("Leave", StringComparison.OrdinalIgnoreCase))
                {
                    var leaveType = await _context.LeaveTypes.FirstOrDefaultAsync() ?? new LeaveType { Name = "Casual Leave", Code = "CL" };
                    await _context.EmployeeLeaves.AddAsync(new EmployeeLeave
                    {
                        EmployeeId = empId,
                        LeaveTypeId = leaveType.LeaveTypeId,
                        FromDate = r.Date.Value.Date,
                        ToDate = r.Date.Value.Date,
                        DurationDays = 1.0m,
                        DurationHours = 8.0m,
                        Reason = r.Remarks ?? "Leave recorded in Excel",
                        Status = LeaveStatusEnum.Approved
                    });
                    imported++;
                    continue;
                }

                // Handle Work Entry
                int? workItemId = null;
                if (!string.IsNullOrWhiteSpace(r.NormalizedTaskNumber))
                {
                    var wi = await _context.WorkItems.FirstOrDefaultAsync(w => w.WorkItemNumber == r.NormalizedTaskNumber);
                    if (wi == null)
                    {
                        wi = new WorkItem
                        {
                            WorkItemNumber = r.NormalizedTaskNumber,
                            Title = !string.IsNullOrWhiteSpace(r.NormalizedTitle) ? r.NormalizedTitle : (r.RawTask ?? "Task"),
                            Description = r.RawTask,
                            Status = "In Progress"
                        };
                        await _context.WorkItems.AddAsync(wi);
                        await _context.SaveChangesAsync();
                    }
                    workItemId = wi.WorkItemId;
                }

                // Match Category
                int? categoryId = null;
                if (!string.IsNullOrWhiteSpace(r.Category))
                {
                    var cat = categories.FirstOrDefault(c => c.Name.Equals(r.Category, StringComparison.OrdinalIgnoreCase));
                    if (cat == null)
                    {
                        cat = new WorkEntryCategory { Name = r.Category, ColorCode = "#3b82f6", IsActive = true };
                        await _context.WorkEntryCategories.AddAsync(cat);
                        await _context.SaveChangesAsync();
                        categories.Add(cat);
                    }
                    categoryId = cat.CategoryId;
                }

                // Match Meeting
                int? meetingId = null;
                if (!string.IsNullOrWhiteSpace(r.Meeting))
                {
                    var m = meetings.FirstOrDefault(x => x.MeetingName.Equals(r.Meeting, StringComparison.OrdinalIgnoreCase));
                    if (m == null)
                    {
                        m = new Meeting { MeetingName = r.Meeting, DefaultDurationHours = r.MeetingEffort > 0 ? r.MeetingEffort : 0.5m, IsActive = true };
                        await _context.Meetings.AddAsync(m);
                        await _context.SaveChangesAsync();
                        meetings.Add(m);
                    }
                    meetingId = m.MeetingId;
                }

                var entry = new WorkEntry
                {
                    EmployeeId = empId,
                    WorkDate = r.Date.Value.Date,
                    WorkItemId = workItemId,
                    TaskNumber = r.NormalizedTaskNumber,
                    Description = !string.IsNullOrWhiteSpace(r.RawTask) ? r.RawTask : (r.Meeting ?? "Work Entry"),
                    CategoryId = categoryId,
                    MeetingId = meetingId,
                    MeetingName = r.Meeting,
                    PlannedEffortHours = r.TotalEffort,
                    MeetingEffortHours = r.MeetingEffort,
                    WorkEffortHours = r.WorkEffort,
                    TotalEffortHours = r.TotalEffort,
                    Status = !string.IsNullOrWhiteSpace(r.Remarks) && r.Remarks.Contains("Completed", StringComparison.OrdinalIgnoreCase) ? "Completed" : "In Progress",
                    Remarks = r.Remarks
                };

                await _context.WorkEntries.AddAsync(entry);
                imported++;
            }
            catch (Exception ex)
            {
                errors++;
                messages.Add($"Error on row {r.RowIndex} in {r.SheetName}: {ex.Message}");
            }
        }

        await _context.SaveChangesAsync();

        job.ImportedRows = imported;
        job.ErrorRows = errors;
        job.Status = errors > 0 ? ImportJobStatusEnum.CompletedWithWarnings : ImportJobStatusEnum.Completed;
        job.ErrorLog = messages.Any() ? string.Join("\n", messages) : null;
        await _context.SaveChangesAsync();

        return ApiResponse<ImportResultDto>.Ok(new ImportResultDto
        {
            ImportJobId = job.ImportJobId,
            TotalProcessed = request.RowsToImport.Count,
            ImportedCount = imported,
            SkippedCount = skipped,
            ErrorsCount = errors,
            Status = job.Status.ToString(),
            Messages = messages
        });
    }

    public async Task<ApiResponse<List<ImportJob>>> GetImportHistoryAsync()
    {
        var history = await _context.ImportJobs.OrderByDescending(j => j.CreatedAt).ToListAsync();
        return ApiResponse<List<ImportJob>>.Ok(history);
    }

    private static (string? TaskNo, string? Title) ExtractTaskDetails(string rawTask)
    {
        if (string.IsNullOrWhiteSpace(rawTask)) return (null, null);

        var match = Regex.Match(rawTask, @"(?:Task|Bug|Ticket|CR|#)\s*(?:No\.?\s*)?([A-Za-z0-9\-_]+)[:\s\-]*(.*)", RegexOptions.IgnoreCase);
        if (match.Success)
        {
            var taskNo = match.Groups[1].Value.Trim();
            var title = match.Groups[2].Value.Trim();
            return (taskNo, string.IsNullOrWhiteSpace(title) ? rawTask : title);
        }

        if (Regex.IsMatch(rawTask.Trim(), @"^\d{4,8}$"))
        {
            return (rawTask.Trim(), "Task " + rawTask.Trim());
        }

        return (null, rawTask);
    }
}
