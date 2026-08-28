namespace DWPTS.Application.Common;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? Username { get; }
    string? Role { get; }
    int? EmployeeId { get; }
    bool IsAdmin { get; }
    bool IsManager { get; }
}

