using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Shared.Models;

namespace DWPTS.API.Controllers;

[Authorize(Roles = "ADMIN")]
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<UserDto>>>> GetUsers([FromQuery] PaginationFilter filter)
    {
        var result = await _userService.GetUsersAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(int id)
    {
        var result = await _userService.GetUserByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserDto request)
    {
        var result = await _userService.CreateUserAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(int id, [FromBody] UpdateUserDto request)
    {
        var result = await _userService.UpdateUserAsync(id, request);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteUser(int id)
    {
        var result = await _userService.DeleteUserAsync(id);
        return Ok(result);
    }

    [HttpGet("roles")]
    public async Task<ActionResult<ApiResponse<List<string>>>> GetRoles()
    {
        var result = await _userService.GetRolesAsync();
        return Ok(result);
    }
}

[Authorize]
[ApiController]
[Route("api/employees")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<EmployeeDto>>>> GetAll()
    {
        var result = await _employeeService.GetAllEmployeesAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> GetById(int id)
    {
        var result = await _employeeService.GetEmployeeByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> Create([FromBody] CreateEmployeeDto request)
    {
        var result = await _employeeService.CreateEmployeeAsync(request);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,MANAGER")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> Update(int id, [FromBody] UpdateEmployeeDto request)
    {
        var result = await _employeeService.UpdateEmployeeAsync(id, request);
        return Ok(result);
    }
}

[Authorize(Roles = "ADMIN")]
[ApiController]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<AuditLogDto>>>> GetAuditLogs([FromQuery] PaginationFilter filter)
    {
        var result = await _auditLogService.GetAuditLogsAsync(filter);
        return Ok(result);
    }
}

[Authorize]
[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetUserNotifications(int userId)
    {
        var result = await _notificationService.GetUserNotificationsAsync(userId);
        return Ok(result);
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult<ApiResponse>> MarkAsRead(int id)
    {
        var result = await _notificationService.MarkAsReadAsync(id);
        return Ok(result);
    }
}

[Authorize]
[ApiController]
[Route("api/system-settings")]
public class SystemSettingsController : ControllerBase
{
    private readonly ISystemSettingService _settingService;

    public SystemSettingsController(ISystemSettingService settingService)
    {
        _settingService = settingService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SystemSettingDto>>>> GetAll()
    {
        var result = await _settingService.GetAllSettingsAsync();
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{key}")]
    public async Task<ActionResult<ApiResponse<SystemSettingDto>>> Update(string key, [FromBody] string value)
    {
        var result = await _settingService.UpdateSettingAsync(key, value);
        return Ok(result);
    }
}


