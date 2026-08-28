using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Shared.Models;

namespace DWPTS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/import")]
public class ImportController : ControllerBase
{
    private readonly IExcelImportService _importService;

    public ImportController(IExcelImportService importService)
    {
        _importService = importService;
    }

    [HttpPost("preview")]
    public async Task<ActionResult<ApiResponse<ImportPreviewDto>>> PreviewExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<ImportPreviewDto>.Fail("No Excel file uploaded."));

        using var stream = file.OpenReadStream();
        var result = await _importService.PreviewExcelAsync(stream, file.FileName);
        return Ok(result);
    }

    [HttpPost("confirm")]
    public async Task<ActionResult<ApiResponse<ImportResultDto>>> ConfirmImport([FromBody] ConfirmImportRequestDto request)
    {
        var result = await _importService.ConfirmImportAsync(request);
        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<ActionResult<ApiResponse>> GetHistory()
    {
        var result = await _importService.GetImportHistoryAsync();
        return Ok(result);
    }
}

[Authorize]
[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportController(IExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpGet("daily/excel")]
    public async Task<IActionResult> ExportDailyExcel([FromQuery] DateTime? date, [FromQuery] int? employeeId)
    {
        var d = date ?? DateTime.Today;
        var bytes = await _exportService.ExportDailyExcelAsync(d, employeeId);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Daily_Work_{d:yyyyMMdd}.xlsx");
    }

    [HttpGet("weekly/excel")]
    public async Task<IActionResult> ExportWeeklyExcel([FromQuery] DateTime? weekStartDate, [FromQuery] int? employeeId)
    {
        var d = weekStartDate ?? DateTime.Today;
        var bytes = await _exportService.ExportWeeklyExcelAsync(d, employeeId);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Weekly_Summary_{d:yyyyMMdd}.xlsx");
    }

    [HttpGet("monthly/excel")]
    public async Task<IActionResult> ExportMonthlyExcel([FromQuery] int? year, [FromQuery] int? month, [FromQuery] int? employeeId)
    {
        var y = year ?? DateTime.Today.Year;
        var m = month ?? DateTime.Today.Month;
        var bytes = await _exportService.ExportMonthlyExcelAsync(y, m, employeeId);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Monthly_Report_{y}_{m:D2}.xlsx");
    }

    [HttpGet("yearly/excel")]
    public async Task<IActionResult> ExportYearlyExcel([FromQuery] int? year, [FromQuery] int? employeeId)
    {
        var y = year ?? DateTime.Today.Year;
        var bytes = await _exportService.ExportYearlyExcelAsync(y, employeeId);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Yearly_Summary_{y}.xlsx");
    }

    [HttpGet("all-data/csv")]
    public async Task<IActionResult> ExportAllDataCsv([FromQuery] WorkEntryFilterDto filter)
    {
        var bytes = await _exportService.ExportAllDataCsvAsync(filter);
        return File(bytes, "text/csv", $"AllData_Export_{DateTime.Today:yyyyMMdd}.csv");
    }
}
