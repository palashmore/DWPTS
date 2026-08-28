using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Application.Common;
using DWPTS.Shared.Models;

namespace DWPTS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(IAuthService authService, ICurrentUserService currentUserService)
    {
        _authService = authService;
        _currentUserService = currentUserService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetProfile()
    {
        if (!_currentUserService.UserId.HasValue) return Unauthorized();
        var result = await _authService.GetProfileAsync(_currentUserService.UserId.Value);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
