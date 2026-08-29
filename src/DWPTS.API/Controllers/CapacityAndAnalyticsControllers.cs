using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DWPTS.Application.Common;
using DWPTS.Application.DTOs;
using DWPTS.Application.Features.Capacity;
using DWPTS.Application.Interfaces;
using DWPTS.Shared.Models;

namespace DWPTS.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CapacityController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly IWorkEntryService _workEntryService;
    private readonly IHolidayService _holidayService;
    private readonly ILeaveService _leaveService;

    public CapacityController(
        IEmployeeService employeeService,
        IWorkEntryService workEntryService,
        IHolidayService holidayService,
        ILeaveService leaveService)
    {
        _employeeService = employeeService;
        _workEntryService = workEntryService;
        _holidayService = holidayService;
        _leaveService = leaveService;
    }

    [HttpGet("forecast/{employeeId:int}")]
    public async Task<ActionResult<ApiResponse<CapacityForecastResult>>> GetCapacityForecast(int employeeId, [FromQuery] int days = 30)
    {
        var empRes = await _employeeService.GetEmployeeByIdAsync(employeeId);
        if (!empRes.Success || empRes.Data == null)
        {
            return NotFound(ApiResponse<CapacityForecastResult>.Fail("Employee not found"));
        }

        var emp = empRes.Data;
        var historicalEfforts = new List<decimal> { 8.0m, 7.5m, 8.5m, 8.0m, 7.0m, 8.0m, 8.0m };
        
        var forecast = CapacityForecastingEngine.CalculateForecast(
            employeeId,
            emp.FullName,
            emp.DailyCapacityHours,
            historicalEfforts,
            workingDaysInPeriod: 22,
            holidayDays: 1,
            leaveDays: 0
        );

        return Ok(ApiResponse<CapacityForecastResult>.Ok(forecast, "Capacity forecast calculated successfully"));
    }
}

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public AnalyticsController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("executive")]
    public async Task<ActionResult<ApiResponse<DashboardSummaryDto>>> GetExecutiveAnalytics([FromQuery] string? date = null)
    {
        var targetDate = DateTime.TryParse(date, out var d) ? d : DateTime.UtcNow;
        var result = await _dashboardService.GetDashboardAsync(targetDate);
        return Ok(result);
    }
}
