namespace DWPTS.Application.DTOs;

public class UserDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public List<string> Roles { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int? EmployeeId { get; set; }
    public List<string> Roles { get; set; } = new();
}

public class UpdateUserDto
{
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public bool IsActive { get; set; }
    public List<string> Roles { get; set; } = new();
}

public class EmployeeDto
{
    public int EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string Email { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Designation { get; set; }
    public decimal DailyCapacityHours { get; set; } = 8.0m;
    public bool IsActive { get; set; } = true;
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
}

public class CreateEmployeeDto
{
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Designation { get; set; }
    public decimal DailyCapacityHours { get; set; } = 8.0m;
    public int? ManagerId { get; set; }
}

public class UpdateEmployeeDto : CreateEmployeeDto
{
    public bool IsActive { get; set; } = true;
}

