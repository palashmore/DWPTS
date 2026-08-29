using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using DWPTS.API.Hubs;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Shared.Models;

namespace DWPTS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/work-entries")]
public class WorkEntriesController : ControllerBase
{
    private readonly IWorkEntryService _workEntryService;
    private readonly IHubContext<WorkNotificationHub> _hubContext;

    public WorkEntriesController(IWorkEntryService workEntryService, IHubContext<WorkNotificationHub> hubContext)
    {
        _workEntryService = workEntryService;
        _hubContext = hubContext;
    }

    [HttpGet("daily")]
    public async Task<ActionResult<ApiResponse<DailyWorkScreenDto>>> GetDailyWork([FromQuery] DateTime? date, [FromQuery] int? employeeId)
    {
        var targetDate = date ?? DateTime.Today;
        var result = await _workEntryService.GetDailyWorkAsync(targetDate, employeeId);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<WorkEntryDto>>>> GetWorkEntries([FromQuery] WorkEntryFilterDto filter)
    {
        var result = await _workEntryService.GetWorkEntriesAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<WorkEntryDto>>> GetWorkEntryById(int id)
    {
        var result = await _workEntryService.GetWorkEntryByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<WorkEntryDto>>> CreateWorkEntry([FromBody] CreateWorkEntryDto request)
    {
        var result = await _workEntryService.CreateWorkEntryAsync(request);
        if (result.Success)
        {
            await _hubContext.Clients.All.SendAsync("WorkEntryChanged", result.Data);
        }
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<WorkEntryDto>>> UpdateWorkEntry(int id, [FromBody] UpdateWorkEntryDto request)
    {
        var result = await _workEntryService.UpdateWorkEntryAsync(id, request);
        if (result.Success)
        {
            await _hubContext.Clients.All.SendAsync("WorkEntryChanged", result.Data);
        }
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteWorkEntry(int id)
    {
        var result = await _workEntryService.DeleteWorkEntryAsync(id);
        if (result.Success)
        {
            await _hubContext.Clients.All.SendAsync("WorkEntryChanged", new { WorkEntryId = id, Deleted = true });
        }
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost("copy")]
    public async Task<ActionResult<ApiResponse<List<WorkEntryDto>>>> CopyEntries([FromBody] CopyWorkEntriesRequestDto request)
    {
        var result = await _workEntryService.CopyEntriesAsync(request);
        if (result.Success)
        {
            await _hubContext.Clients.All.SendAsync("WorkEntryChanged", result.Data);
        }
        return Ok(result);
    }

    [HttpPost("{id}/remarks")]
    public async Task<ActionResult<ApiResponse<WorkEntryRemarkDto>>> AddRemark(int id, [FromBody] AddRemarkDto request)
    {
        var result = await _workEntryService.AddRemarkAsync(id, request);
        return Ok(result);
    }
}
