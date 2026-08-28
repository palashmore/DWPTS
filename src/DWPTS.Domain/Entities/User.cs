using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class User : BaseEntity
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    
    public int? EmployeeId { get; set; }
    public virtual Employee? Employee { get; set; }
    
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

