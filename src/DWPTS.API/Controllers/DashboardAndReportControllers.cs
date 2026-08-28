using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Shared.Models;

namespace DWPTS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardSummaryDto>>> GetDashboard([FromQuery] DateTime? date, [FromQuery] int? employeeId)
    {
        var targetDate = date ?? DateTime.Today;
        var result = await _dashboardService.GetDashboardAsync(targetDate, employeeId);
        return Ok(result);
    }
}

[Authorize]
[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("daily")]
    public async Task<ActionResult<ApiResponse<DailyWorkScreenDto>>> GetDaily([FromQuery] DateTime? date, [FromQuery] int? employeeId)
    {
        var d = date ?? DateTime.Today;
        var result = await _reportService.GetDailyReportAsync(d, employeeId);
        return Ok(result);
    }

    [HttpGet("weekly")]
    public async Task<ActionResult<ApiResponse<WeeklyReportDto>>> GetWeekly([FromQuery] DateTime? weekStartDate, [FromQuery] int? employeeId)
    {
        var d = weekStartDate ?? DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek + 1);
        var result = await _reportService.GetWeeklyReportAsync(d, employeeId);
        return Ok(result);
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<ApiResponse<MonthlyReportDto>>> GetMonthly([FromQuery] int? year, [FromQuery] int? month, [FromQuery] int? employeeId)
    {
        var y = year ?? DateTime.Today.Year;
        var m = month ?? DateTime.Today.Month;
        var result = await _reportService.GetMonthlyReportAsync(y, m, employeeId);
        return Ok(result);
    }

    [HttpGet("yearly")]
    public async Task<ActionResult<ApiResponse<YearlyReportDto>>> GetYearly([FromQuery] int? year, [FromQuery] int? employeeId)
    {
        var y = year ?? DateTime.Today.Year;
        var result = await _reportService.GetYearlyReportAsync(y, employeeId);
        return Ok(result);
    }
}
