using System.Globalization;
using System.Text;
using ClosedXML.Excel;
using CsvHelper;
using Microsoft.EntityFrameworkCore;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Infrastructure.Data;

namespace DWPTS.Infrastructure.Services;

public class ExportService : IExportService
{
    private readonly DWPTSDbContext _context;
    private readonly IWorkEntryService _workEntryService;
    private readonly IReportService _reportService;

    public ExportService(DWPTSDbContext context, IWorkEntryService workEntryService, IReportService reportService)
    {
        _context = context;
        _workEntryService = workEntryService;
        _reportService = reportService;
    }

    public async Task<byte[]> ExportDailyExcelAsync(DateTime date, int? employeeId = null)
    {
        var data = (await _workEntryService.GetDailyWorkAsync(date, employeeId)).Data;
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Daily Work");

        ws.Cell(1, 1).Value = "Date:";
        ws.Cell(1, 2).Value = date.ToString("yyyy-MM-dd");
        ws.Cell(1, 4).Value = "Capacity:";
        ws.Cell(1, 5).Value = data?.DailyCapacityHours ?? 8.0m;
        ws.Cell(1, 7).Value = "Total Actual:";
        ws.Cell(1, 8).Value = data?.TotalActualHours ?? 0.0m;

        var headers = new[] { "Task #", "Description", "Category", "Meeting", "Planned (h)", "Meeting (h)", "Work (h)", "Total (h)", "Variance", "Status", "Remarks" };
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(3, i + 1).Value = headers[i];
            ws.Cell(3, i + 1).Style.Font.Bold = true;
            ws.Cell(3, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        int row = 4;
        if (data?.Entries != null)
        {
            foreach (var e in data.Entries)
            {
                ws.Cell(row, 1).Value = e.TaskNumber ?? "";
                ws.Cell(row, 2).Value = e.Description;
                ws.Cell(row, 3).Value = e.CategoryName ?? "";
                ws.Cell(row, 4).Value = e.MeetingName ?? "";
                ws.Cell(row, 5).Value = e.PlannedEffortHours;
                ws.Cell(row, 6).Value = e.MeetingEffortHours;
                ws.Cell(row, 7).Value = e.WorkEffortHours;
                ws.Cell(row, 8).Value = e.TotalEffortHours;
                ws.Cell(row, 9).Value = e.VarianceHours;
                ws.Cell(row, 10).Value = e.Status;
                ws.Cell(row, 11).Value = e.Remarks ?? "";
                row++;
            }
        }

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public async Task<byte[]> ExportWeeklyExcelAsync(DateTime weekStartDate, int? employeeId = null)
    {
        var data = (await _reportService.GetWeeklyReportAsync(weekStartDate, employeeId)).Data;
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Weekly Summary");

        ws.Cell(1, 1).Value = $"Weekly Summary ({weekStartDate:yyyy-MM-dd} to {weekStartDate.AddDays(6):yyyy-MM-dd})";
        ws.Cell(1, 1).Style.Font.Bold = true;

        var headers = new[] { "Date", "Day", "Planned (h)", "Meeting (h)", "Work (h)", "Actual (h)", "Variance", "Status" };
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(3, i + 1).Value = headers[i];
            ws.Cell(3, i + 1).Style.Font.Bold = true;
            ws.Cell(3, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        int row = 4;
        if (data?.DailyBreakdown != null)
        {
            foreach (var d in data.DailyBreakdown)
            {
                ws.Cell(row, 1).Value = d.Date.ToString("yyyy-MM-dd");
                ws.Cell(row, 2).Value = d.DayName;
                ws.Cell(row, 3).Value = d.PlannedHours;
                ws.Cell(row, 4).Value = d.MeetingHours;
                ws.Cell(row, 5).Value = d.WorkHours;
                ws.Cell(row, 6).Value = d.ActualHours;
                ws.Cell(row, 7).Value = d.VarianceHours;
                ws.Cell(row, 8).Value = d.Status;
                row++;
            }
        }

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public async Task<byte[]> ExportMonthlyExcelAsync(int year, int month, int? employeeId = null)
    {
        var data = (await _reportService.GetMonthlyReportAsync(year, month, employeeId)).Data;
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Monthly Report");

        ws.Cell(1, 1).Value = $"Monthly Report - {new DateTime(year, month, 1):MMMM yyyy}";
        ws.Cell(1, 1).Style.Font.Bold = true;

        var headers = new[] { "Week #", "Start Date", "End Date", "Work (h)", "Meeting (h)", "Combined Total (h)", "Working Days", "Holidays", "Leave" };
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(3, i + 1).Value = headers[i];
            ws.Cell(3, i + 1).Style.Font.Bold = true;
            ws.Cell(3, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        int row = 4;
        if (data?.Weeks != null)
        {
            foreach (var w in data.Weeks)
            {
                ws.Cell(row, 1).Value = w.WeekNumber;
                ws.Cell(row, 2).Value = w.StartDate.ToString("yyyy-MM-dd");
                ws.Cell(row, 3).Value = w.EndDate.ToString("yyyy-MM-dd");
                ws.Cell(row, 4).Value = w.WorkHours;
                ws.Cell(row, 5).Value = w.MeetingHours;
                ws.Cell(row, 6).Value = w.ActualHours;
                ws.Cell(row, 7).Value = w.WorkingDays;
                ws.Cell(row, 8).Value = w.Holidays;
                ws.Cell(row, 9).Value = w.LeaveDays;
                row++;
            }
        }

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public async Task<byte[]> ExportYearlyExcelAsync(int year, int? employeeId = null)
    {
        var data = (await _reportService.GetYearlyReportAsync(year, employeeId)).Data;
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Yearly Summary");

        ws.Cell(1, 1).Value = $"Yearly Summary - {year}";
        ws.Cell(1, 1).Style.Font.Bold = true;

        var headers = new[] { "Month", "Total Work Effort (hrs)", "Total Meeting Effort (hrs)", "Combined Total (hrs)", "Working Days", "Holidays", "Leave", "Utilization %" };
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(3, i + 1).Value = headers[i];
            ws.Cell(3, i + 1).Style.Font.Bold = true;
            ws.Cell(3, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        int row = 4;
        if (data?.Months != null)
        {
            foreach (var m in data.Months)
            {
                ws.Cell(row, 1).Value = m.MonthName;
                ws.Cell(row, 2).Value = m.WorkEffortHours;
                ws.Cell(row, 3).Value = m.MeetingEffortHours;
                ws.Cell(row, 4).Value = m.CombinedTotalHours;
                ws.Cell(row, 5).Value = m.WorkingDays;
                ws.Cell(row, 6).Value = m.Holidays;
                ws.Cell(row, 7).Value = m.LeaveDays;
                ws.Cell(row, 8).Value = m.UtilizationPercentage;
                row++;
            }

            // Grand Total Row
            ws.Cell(row, 1).Value = "Grand Total";
            ws.Cell(row, 2).Value = data.GrandTotalWorkHours;
            ws.Cell(row, 3).Value = data.GrandTotalMeetingHours;
            ws.Cell(row, 4).Value = data.GrandCombinedTotalHours;
            ws.Row(row).Style.Font.Bold = true;
        }

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public async Task<byte[]> ExportAllDataCsvAsync(WorkEntryFilterDto filter)
    {
        filter.PageSize = 50000;
        var data = (await _workEntryService.GetWorkEntriesAsync(filter)).Data;

        using var ms = new MemoryStream();
        using var writer = new StreamWriter(ms, Encoding.UTF8);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        if (data?.Items != null)
        {
            csv.WriteRecords(data.Items.Select(e => new
            {
                e.WorkDate,
                e.DayName,
                e.EmployeeName,
                e.TaskNumber,
                e.Description,
                e.CategoryName,
                e.MeetingName,
                e.PlannedEffortHours,
                e.MeetingEffortHours,
                e.WorkEffortHours,
                e.TotalEffortHours,
                e.VarianceHours,
                e.Status,
                e.Remarks
            }));
        }

        writer.Flush();
        return ms.ToArray();
    }

    public async Task<byte[]> ExportWorkItemHistoryPdfAsync(int workItemId)
    {
        var wi = await _context.WorkItems
            .Include(w => w.WorkEntries)
            .FirstOrDefaultAsync(w => w.WorkItemId == workItemId);

        var sb = new StringBuilder();
        sb.AppendLine($"WORK ITEM HISTORY REPORT");
        sb.AppendLine($"Task Number: {wi?.WorkItemNumber}");
        sb.AppendLine($"Title: {wi?.Title}");
        sb.AppendLine($"Total Effort: {wi?.WorkEntries.Sum(e => e.TotalEffortHours)} hrs");
        sb.AppendLine(new string('-', 50));
        sb.AppendLine($"Date | Hours | Status | Remarks");

        if (wi?.WorkEntries != null)
        {
            foreach (var e in wi.WorkEntries.OrderBy(e => e.WorkDate))
            {
                sb.AppendLine($"{e.WorkDate:yyyy-MM-dd} | {e.TotalEffortHours}h | {e.Status} | {e.Remarks}");
            }
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
