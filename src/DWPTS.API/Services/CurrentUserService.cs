using System.Security.Claims;
using DWPTS.Application.Common;

namespace DWPTS.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? UserId
    {
        get
        {
            var idClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : null;
        }
    }

    public string? Username => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;
    public string? Role => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

    public int? EmployeeId
    {
        get
        {
            var empClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("EmployeeId")?.Value;
            return int.TryParse(empClaim, out var id) ? id : null;
        }
    }

    public bool IsAdmin => _httpContextAccessor.HttpContext?.User?.IsInRole("ADMIN") ?? false;
    public bool IsManager => _httpContextAccessor.HttpContext?.User?.IsInRole("MANAGER") ?? false;
}
