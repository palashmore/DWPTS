using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Shared.Models;

namespace DWPTS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/work-items")]
public class WorkItemsController : ControllerBase
{
    private readonly IWorkItemService _workItemService;

    public WorkItemsController(IWorkItemService workItemService)
    {
        _workItemService = workItemService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<WorkItemDto>>>> GetWorkItems([FromQuery] PaginationFilter filter, [FromQuery] string? status, [FromQuery] int? typeId)
    {
        var result = await _workItemService.GetWorkItemsAsync(filter, status, typeId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<WorkItemDto>>> GetWorkItemById(int id)
    {
        var result = await _workItemService.GetWorkItemByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpGet("{id}/timeline")]
    public async Task<ActionResult<ApiResponse<WorkItemTimelineDto>>> GetWorkItemTimeline(int id)
    {
        var result = await _workItemService.GetWorkItemTimelineAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<WorkItemDto>>> CreateWorkItem([FromBody] CreateWorkItemDto request)
    {
        var result = await _workItemService.CreateWorkItemAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<WorkItemDto>>> UpdateWorkItem(int id, [FromBody] UpdateWorkItemDto request)
    {
        var result = await _workItemService.UpdateWorkItemAsync(id, request);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }
}
