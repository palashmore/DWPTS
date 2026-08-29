using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Shared.Models;

namespace DWPTS.API.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAll()
    {
        var result = await _categoryService.GetAllCategoriesAsync();
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create([FromBody] CreateCategoryDto request)
    {
        var result = await _categoryService.CreateCategoryAsync(request);
        return Ok(result);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(int id, [FromBody] CreateCategoryDto request)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, request);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(int id)
    {
        var result = await _categoryService.DeleteCategoryAsync(id);
        return Ok(result);
    }
}

[ApiController]
[Route("api/meetings")]
public class MeetingsController : ControllerBase
{
    private readonly IMeetingService _meetingService;

    public MeetingsController(IMeetingService meetingService)
    {
        _meetingService = meetingService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<MeetingDto>>>> GetAll()
    {
        var result = await _meetingService.GetAllMeetingsAsync();
        return Ok(result);
    }

    [HttpGet("analysis")]
    public async Task<ActionResult<ApiResponse<List<MeetingAnalysisDto>>>> GetAnalysis([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
    {
        var result = await _meetingService.GetMeetingAnalysisAsync(fromDate, toDate);
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<MeetingDto>>> Create([FromBody] MeetingDto request)
    {
        var result = await _meetingService.CreateMeetingAsync(request);
        return Ok(result);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<MeetingDto>>> Update(int id, [FromBody] MeetingDto request)
    {
        var result = await _meetingService.UpdateMeetingAsync(id, request);
        return Ok(result);
    }
}

[Authorize]
[ApiController]
[Route("api/calendar")]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendarService;

    public CalendarController(ICalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<CalendarMonthDto>>> GetMonthlyCalendar([FromQuery] int? year, [FromQuery] int? month, [FromQuery] int? employeeId)
    {
        var y = year ?? DateTime.Today.Year;
        var m = month ?? DateTime.Today.Month;
        var result = await _calendarService.GetMonthlyCalendarAsync(y, m, employeeId);
        return Ok(result);
    }
}

[ApiController]
[Route("api/holidays")]
public class HolidaysController : ControllerBase
{
    private readonly IHolidayService _holidayService;

    public HolidaysController(IHolidayService holidayService)
    {
        _holidayService = holidayService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<HolidayDto>>>> GetHolidays([FromQuery] int? year)
    {
        var y = year ?? DateTime.Today.Year;
        var result = await _holidayService.GetHolidaysAsync(y);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<HolidayDto>>> Create([FromBody] HolidayDto request)
    {
        var result = await _holidayService.CreateHolidayAsync(request);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(int id)
    {
        var result = await _holidayService.DeleteHolidayAsync(id);
        return Ok(result);
    }
}

[ApiController]
[Route("api/leaves")]
public class LeavesController : ControllerBase
{
    private readonly ILeaveService _leaveService;

    public LeavesController(ILeaveService leaveService)
    {
        _leaveService = leaveService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<LeaveDto>>>> GetLeaves([FromQuery] int? employeeId, [FromQuery] int? year)
    {
        var result = await _leaveService.GetLeavesAsync(employeeId, year);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<LeaveDto>>> ApplyLeave([FromBody] CreateLeaveDto request)
    {
        var result = await _leaveService.ApplyLeaveAsync(request);
        return Ok(result);
    }

    [Authorize]
    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<LeaveDto>>> UpdateStatus(int id, [FromBody] UpdateLeaveStatusDto request)
    {
        var result = await _leaveService.UpdateLeaveStatusAsync(id, request);
        return Ok(result);
    }
}
