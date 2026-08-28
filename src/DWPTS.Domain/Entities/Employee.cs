using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class Employee : BaseEntity
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
    public virtual Employee? Manager { get; set; }
    public virtual ICollection<Employee> Subordinates { get; set; } = new List<Employee>();
    
    public virtual User? User { get; set; }
    public virtual ICollection<WorkEntry> WorkEntries { get; set; } = new List<WorkEntry>();
    public virtual ICollection<EmployeeLeave> Leaves { get; set; } = new List<EmployeeLeave>();
    public virtual ICollection<DailySummary> DailySummaries { get; set; } = new List<DailySummary>();
}

